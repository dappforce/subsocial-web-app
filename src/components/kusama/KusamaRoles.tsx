import { KusamaBareProps } from "./types"
import { Tag } from "antd"
import { useKusamaContext } from "./KusamaContext"

export const KusamaRolesTags = ({ address }: KusamaBareProps) => {
  const { whoIAm } = useKusamaContext()

  const roles = whoIAm(address)

  return <div className='d-flex'>
    {roles.map(role => <Tag key={role} color='black' className='mr-3'>{role}</Tag>)}
  </div>
}
