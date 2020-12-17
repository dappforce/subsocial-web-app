import React, { useState } from 'react'
import { CloseCircleOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import SearchInput from '../components/search/SearchInput'
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext'
import AuthorizationPanel from '../components/auth/AuthorizationPanel'
import Link from 'next/link'
import { useResponsiveSize } from 'src/components/responsive'
import { SignInMobileStub } from 'src/components/auth/AuthButtons'
import { isMobileDevice } from 'src/config/Size.config'
import { uiShowSearch } from 'src/components/utils/env'

const InnerMenu = () => {
  const { toggle } = useSidebarCollapsed()
  const { isMobile } = useResponsiveSize()
  const [ show, setShow ] = useState(false)

  const logoImg = isMobile ? '/subsocial-sign.svg' : '/subsocial-logo.svg'

  return uiShowSearch && show
    ? <div className='DfTopBar DfTopBar--search'>
      <SearchInput/>
      <CloseCircleOutlined className='DfCloseSearchIcon' onClick={() => setShow(false)} />
    </div>
    : <div className='DfTopBar'>
      <div className='DfTopBar--leftContent'>
        <Button type='link' onClick={toggle} /* onMouseEnter={open} */ className='DfBurgerIcon'>
          <MenuOutlined style={{ fontSize: '20px', color: '#999' }} />
        </Button>
        <Link href='/' as='/'>
          <a className={`DfBrand ${isMobile && 'mobile'}`}>
            <img src={logoImg} alt='Subsocial' />
          </a>
        </Link>
      </div>
      {/* {isNotMobile && uiShowSearch && <SearchInput/>} */}
      <div className='DfTopBar--rightContent'>
        {uiShowSearch &&
          <SearchOutlined className='DfSearchIcon' onClick={() => setShow(true)} />
        }
        {isMobileDevice
          ? <SignInMobileStub />
          : <AuthorizationPanel />
        }
      </div>
    </div>
}

export default InnerMenu
