"use client";
import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import { useCurrentTheme } from '@/hooks/use-current-theme';


const SignInPage = () => {
  const currentTheme=useCurrentTheme();
  return (
    <div className='flex flex-col max-w-3xl mx-auto w-full min-h-screen'>
      <section className='flex-1 flex items-center justify-center pt-[16vh] 2xl:pt-48 pb-16'>
        <div className='w-full max-w-md'>
          <SignIn 
            appearance={{
              baseTheme:currentTheme==="dark"?dark:undefined,
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-lg border-0'
              }
            }}
            routing="path"
            path="/sign-in"
  
            signInUrl="/sign-in"
          />
        </div>
      </section>
    </div>
  )
}

export default SignInPage