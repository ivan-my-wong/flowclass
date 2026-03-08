import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { LuEye, LuEyeOff } from 'react-icons/lu'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { changeOtherUserPassword } from '@/api/admin'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import Text from '@/components/ui/Text'
import ContentLayout from '@/layouts/ContentLayout'

interface ChangePasswordForm {
  email: string
  newPassword: string
  confirmPassword: string
}

const ChangeUserPassword = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ChangePasswordForm>({
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Change password mutation
  const { mutate: changePasswordMutation, isLoading } = useMutation({
    mutationFn: ({
      email,
      newPassword,
    }: {
      email: string
      newPassword: string
    }) => changeOtherUserPassword(email, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully')
      form.reset()
    },
    onError: (error: any) => {
      toast.error(
        error?.message || 'Failed to change password. Please try again.'
      )
    },
  })

  const onSubmit = (data: ChangePasswordForm) => {
    changePasswordMutation({
      email: data.email,
      newPassword: data.newPassword,
    })
  }

  return (
    <ContentLayout
      leftHeader={
        <Text className="text-2xl font-bold">Change User Password</Text>
      }
    >
      <div className="max-w-md mx-auto p-6">
        <Card className="p-6">
          <Text className="text-lg font-semibold mb-4">
            Change password for any user by entering their email address.
          </Text>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">User Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter user's email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                rules={{
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      'Password must be at least 8 characters with uppercase, lowercase, and number',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <LuEyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <LuEye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: 'Please confirm the new password',
                  validate: value =>
                    value === form.getValues('newPassword') ||
                    'Passwords do not match',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm the new password"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <LuEyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <LuEye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Requirements */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <Text className="font-semibold mb-2">
                  Password Requirements:
                </Text>
                <ul className="text-sm space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• At least one uppercase letter (A-Z)</li>
                  <li>• At least one lowercase letter (a-z)</li>
                  <li>• At least one number (0-9)</li>
                  <li>• At least one special character (@$!%*?&)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                Change Password
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </ContentLayout>
  )
}

export default ChangeUserPassword
