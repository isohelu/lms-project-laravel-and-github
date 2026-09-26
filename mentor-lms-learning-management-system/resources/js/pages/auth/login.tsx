import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import InputError from '@/components/input-error';
import LoadingButton from '@/components/loading-button';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth';
import { index as forgotPassword } from '@/routes/forgot-password';
import { store as login } from '@/routes/login';
import { index as register } from '@/routes/register';

interface LoginProps {
   status?: string;
   canResetPassword: boolean;
   googleLogIn: boolean;
   recaptcha: {
      status: boolean;
      siteKey: string;
      secretKey: string;
   };
}

export default function Login({ status, recaptcha, googleLogIn }: LoginProps) {
   const { props } = usePage<SharedData>();
   const { auth, input, button } = props.translate;
   const recaptchaRef = useRef<ReCAPTCHA | null>(null);
   const [recaptchaToken, setRecaptchaToken] = useState('');
   const [emailValue, setEmailValue] = useState('');
   const [passwordValue, setPasswordValue] = useState('');

   return (
      <AuthLayout
         title={auth.login_title}
         description={auth.login_description}
         headline="Welcome back!"
         subtitle="Continue your learning journey."
      >
         <Head title={auth.login_title} />
         <Form
            {...login.form()}
            resetOnSuccess={['password']}
            onError={() => recaptchaRef.current?.reset()}
            transform={(data) => ({
               ...data,
               recaptcha: recaptchaToken,
               recaptcha_status: recaptcha.status,
            })}
            className="flex flex-col gap-6"
         >
            {({ processing, errors }) => (
               <>
                  <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email">{input.email}</Label>
                        <Input
                           id="email"
                           name="email"
                           type="email"
                           required
                           autoFocus
                           tabIndex={1}
                           autoComplete="email"
                           placeholder={input.email_placeholder}
                           value={emailValue}
                           onChange={(e) => setEmailValue(e.target.value)}
                        />
                        <InputError message={errors.email} />
                     </div>

                     <div className="grid gap-2">
                        <div className="flex items-center">
                           <Label htmlFor="password">{input.password}</Label>
                           <TextLink
                              href={forgotPassword()}
                              className="ml-auto text-sm"
                              tabIndex={5}
                           >
                              {auth.forgot_password}
                           </TextLink>
                        </div>
                        <PasswordInput
                           id="password"
                           name="password"
                           required
                           tabIndex={2}
                           autoComplete="current-password"
                           placeholder={input.password_placeholder}
                           value={passwordValue}
                           onChange={(e) => setPasswordValue(e.target.value)}
                        />
                        <InputError message={errors.password} />
                     </div>

                     {recaptcha.status && (
                        <div>
                           <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={recaptcha.siteKey}
                              onChange={(token) =>
                                 setRecaptchaToken(token ?? '')
                              }
                           />
                           <InputError message={errors.recaptcha} />
                        </div>
                     )}

                     <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" tabIndex={3} />
                        <Label htmlFor="remember" className="mb-0">
                           {input.remember_me}
                        </Label>
                     </div>

                     <LoadingButton
                        loading={processing}
                        type="submit"
                        className="w-full"
                     >
                        {button.login}
                     </LoadingButton>

                     {/* Instant Demo Accounts Panel */}
                     <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-1.5">
                              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className="text-xs font-semibold text-foreground tracking-wide">
                                 Instant Demo Accounts
                              </span>
                           </div>
                           <span className="text-[11px] text-muted-foreground font-mono bg-background/80 px-2 py-0.5 rounded border border-border">
                              Password: <strong className="text-foreground">password123</strong>
                           </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                           Click any role below to auto-fill credentials:
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                           <button
                              type="button"
                              onClick={() => {
                                 setEmailValue('admin@mentor.test');
                                 setPasswordValue('password123');
                              }}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer text-center ${
                                 emailValue === 'admin@mentor.test'
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                    : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                              }`}
                           >
                              <span className="text-xs font-bold text-foreground">👑 Admin</span>
                              <span className="text-[10px] text-muted-foreground truncate w-full mt-0.5">admin@mentor.test</span>
                           </button>
                           
                           <button
                              type="button"
                              onClick={() => {
                                 setEmailValue('instructor@mentor.test');
                                 setPasswordValue('password123');
                              }}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer text-center ${
                                 emailValue === 'instructor@mentor.test'
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                    : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                              }`}
                           >
                              <span className="text-xs font-bold text-foreground">🎓 Instructor</span>
                              <span className="text-[10px] text-muted-foreground truncate w-full mt-0.5">instructor@mentor.test</span>
                           </button>
                           
                           <button
                              type="button"
                              onClick={() => {
                                 setEmailValue('student@mentor.test');
                                 setPasswordValue('password123');
                              }}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer text-center ${
                                 emailValue === 'student@mentor.test'
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                    : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                              }`}
                           >
                              <span className="text-xs font-bold text-foreground">🎒 Student</span>
                              <span className="text-[10px] text-muted-foreground truncate w-full mt-0.5">student@mentor.test</span>
                           </button>
                        </div>
                     </div>

                     {googleLogIn && (
                        <>
                           <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                 {auth.continue_with}
                              </span>
                           </div>

                           <a
                              type="button"
                              className="w-full"
                              href="auth/google"
                           >
                              <Button
                                 type="button"
                                 variant="outline"
                                 className="w-full"
                              >
                                 {button.continue_with_google}
                              </Button>
                           </a>
                        </>
                     )}
                  </div>
                  <div className="space-x-2 text-sm">
                     <span className="text-muted-foreground">
                        {auth.no_account}
                     </span>
                     <Link
                        href={register()}
                        className="underline underline-offset-4"
                     >
                        {button.sign_up}
                     </Link>
                  </div>
               </>
            )}
         </Form>

         {status && (
            <div className="mb-4 text-center text-sm font-medium text-green-600">
               {status}
            </div>
         )}
      </AuthLayout>
   );
}
