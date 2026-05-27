import { Template, waitForPort } from 'e2b'

export const template = Template()
  .fromDockerfile('../e2b.Dockerfile')
  .setStartCmd(
    'cd /home/user && npm run dev -- --hostname 0.0.0.0 --port 3000',
    waitForPort(3000)
  )
