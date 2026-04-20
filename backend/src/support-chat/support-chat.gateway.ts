import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type Role = 'admin' | 'staff' | 'user';

type JoinRoomPayload = {
  conversationId?: number | string;
  roomId?: number | string;
};

type SendMessagePayload = {
  conversationId?: number | string;
  roomId?: number | string;
  message: {
    type: 'text';
    content: string;
  };
};

function asRoomId(payload: JoinRoomPayload | SendMessagePayload): string | null {
  const raw = (payload as any)?.roomId ?? (payload as any)?.conversationId;
  if (raw === undefined || raw === null) return null;
  const id = String(raw).trim();
  if (!id) return null;
  return `conv:${id}`;
}

function getRoleFromHandshake(socket: Socket): Role {
  // For now we support a dev bypass so you can wire up admin/staff UI immediately.
  // Replace with JWT verification later.
  const dev = process.env.DEV_AUTH_BYPASS === 'true';
  const token = String((socket.handshake as any)?.auth?.token ?? '');
  const role = String((socket.handshake as any)?.auth?.role ?? '');

  if (dev && token === 'dev-access-token') {
    if (role === 'staff' || role === 'admin') return role as Role;
    return 'admin';
  }

  return 'user';
}

@WebSocketGateway({
  path: '/socket.io/',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class SupportChatGateway {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    // Attach role for later checks.
    (client.data as any).role = getRoleFromHandshake(client);
  }

  @SubscribeMessage('join_room')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinRoomPayload) {
    const role: Role = (client.data as any).role ?? 'user';
    const room = asRoomId(payload);

    if (!room) {
      // Staff/admin can join a shared room to receive new customer messages.
      if (role === 'admin' || role === 'staff') {
        await client.join('staff:inbox');
        client.emit('joined_room', { roomId: 'staff:inbox' });
        return { ok: true, roomId: 'staff:inbox' };
      }
      return { ok: false, message: 'Missing conversationId/roomId' };
    }

    await client.join(room);
    client.emit('joined_room', { roomId: room });
    return { ok: true, roomId: room };
  }

  @SubscribeMessage('send_message')
  async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: SendMessagePayload) {
    const role: Role = (client.data as any).role ?? 'user';
    const room = asRoomId(payload);
    const content = String(payload?.message?.content ?? '').trim();
    if (!content) return { ok: false, message: 'Missing message.content' };

    // If no room is provided, route customer message to staff inbox.
    if (!room) {
      if (role === 'user') {
        this.server.to('staff:inbox').emit('receive_message', {
          message: payload.message,
          roomId: 'staff:inbox',
          fromRole: role,
          at: new Date().toISOString(),
        });
        return { ok: true };
      }
      return { ok: false, message: 'Missing conversationId/roomId' };
    }

    // Broadcast to the room (both customer + staff/admin in same conversation).
    this.server.to(room).emit('receive_message', {
      message: payload.message,
      roomId: room,
      fromRole: role,
      at: new Date().toISOString(),
    });
    return { ok: true };
  }
}

