import * as React from "react"
import { Avatar, Button, Card, Input, Typography, Upload } from "antd"
import type { UploadFile } from "antd/es/upload/interface"
import { useAuth } from "@/hooks/useAuth"
import { authService } from "@/services/auth.service"
import { getErrorMessage } from "@/utils/errorUtils"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

const initials = (name?: string): string => {
  return (name || "Admin")
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth()
  const { t } = useTranslation()
  const [name, setName] = React.useState(user?.name || "")
  const [avatar, setAvatar] = React.useState(user?.avatar || "")
  const [avatarFileList, setAvatarFileList] = React.useState<UploadFile[]>([])
  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [savingPassword, setSavingPassword] = React.useState(false)

  const onProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    setSavingProfile(true)
    try {
      let nextAvatar = avatar
      const selectedFile = avatarFileList[0]?.originFileObj
      if (selectedFile instanceof File) {
        nextAvatar = await authService.uploadAvatar(selectedFile)
      }

      const updated = await authService.updateProfile({ name: name.trim(), avatar: nextAvatar })
      updateUser(updated)
      setAvatar(nextAvatar)
      setAvatarFileList([])
      toast.success("Profile updated")
      logout()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const onPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required")
      return
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Password confirmation does not match")
      return
    }
    setSavingPassword(true)
    try {
      await authService.changePassword({ oldPassword, newPassword })
      toast.success("Password changed")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Profile</h2>
        <p className="text-muted-foreground">Manage account information and security settings.</p>
      </div>

      <Card>
        <div className="space-y-1">
          <Typography.Text strong>Profile overview</Typography.Text>
          <Typography.Text type="secondary">Current account details</Typography.Text>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar size={64} src={avatar || user?.avatar || undefined}>
            {initials(user?.name)}
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium">{user?.name || "Admin"}</p>
            <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
            <p className="text-sm capitalize text-muted-foreground">Role: {user?.role || "admin"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-1">
          <Typography.Text strong>Update profile</Typography.Text>
          <Typography.Text type="secondary">Update your display name and choose avatar image</Typography.Text>
        </div>
        <div className="mt-4">
          <form className="space-y-4" onSubmit={onProfileSubmit}>
            <div className="space-y-2">
              <Typography.Text strong>Name</Typography.Text>
              <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Typography.Text strong>Choose image</Typography.Text>
              <Upload
                maxCount={1}
                accept="image/*"
                beforeUpload={() => false}
                fileList={avatarFileList}
                onChange={({ fileList }) => setAvatarFileList(fileList)}
              >
                <Button>Choose image</Button>
              </Upload>
            </div>
            <Button type="primary" htmlType="submit" loading={savingProfile}>
              Save profile
            </Button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="space-y-1">
          <Typography.Text strong>Change password</Typography.Text>
          <Typography.Text type="secondary">Use a strong password and keep it secure</Typography.Text>
        </div>
        <div className="mt-4">
          <form className="space-y-4" onSubmit={onPasswordSubmit}>
            <div className="space-y-2">
              <Typography.Text strong>Old password</Typography.Text>
              <Input.Password
                id="old-password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Typography.Text strong>New password</Typography.Text>
              <Input.Password
                id="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Typography.Text strong>Confirm password</Typography.Text>
              <Input.Password
                id="confirm-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <Button type="primary" htmlType="submit" loading={savingPassword}>
              Update password
            </Button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="space-y-1">
          <Typography.Text strong>Session</Typography.Text>
          <Typography.Text type="secondary">End your current session</Typography.Text>
        </div>
        <div className="mt-4">
          <Button danger onClick={logout}>
            {t("header.logout")}
          </Button>
        </div>
      </Card>
    </div>
  )
}
