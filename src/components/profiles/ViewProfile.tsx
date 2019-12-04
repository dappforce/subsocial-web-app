import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';

import { nonEmptyStr, queryBlogsToProp, SeoHeads, isEmptyStr } from '../utils/index';
import { SocialAccount, ProfileData, Profile } from '../types';
import { withSocialAccount, withAddressFromUrl } from '../utils/utils';
import { Dropdown, Icon } from 'semantic-ui-react';
import { FollowAccountButton } from '../utils/FollowButton';
import { AccountFollowersModal, AccountFollowingModal } from './AccountsListModal';
import { ProfileHistoryModal } from '../utils/ListsEditHistory';
import TxButton from '../utils/TxButton';
import { MutedDiv } from '../utils/MutedText';
import { useMyAccount } from '../utils/MyAccountContext';
import Section from '../utils/Section';
import { DfBgImg } from '../utils/DfBgImg';
import { Pluralize } from '../utils/Plularize';
import { BUTTON_SIZE } from '../../config/Size.config';
export type Props = {
  preview?: boolean,
  nameOnly?: boolean,
  withLink?: boolean,
  id: AccountId,
  profile?: Profile,
  profileData?: ProfileData,
  socialAccount?: SocialAccount,
  followers?: AccountId[],
  size?: number
};

function Component(props: Props) {

  const {
    id,
    preview = false,
    nameOnly = false,
    withLink = false,
    size = 48,
    socialAccount,
    profile = {} as Profile,
    profileData = {} as ProfileData
  } = props;

  const address = id.toString();
  const { state: { address: myAddress } } = useMyAccount();
  const profileIsNone = !socialAccount || socialAccount && socialAccount.profile.isNone;
  const followers = socialAccount ? socialAccount.followers_count.toNumber() : 0;
  const following = socialAccount ? socialAccount.following_accounts_count.toNumber() : 0;
  const reputation = socialAccount ? socialAccount.reputation.toNumber() : 0;

  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const {
    username,
    edit_history
  } = profile;

  const {
    fullname,
    avatar,
    email,
    personal_site,
    about,
    facebook,
    twitter,
    linkedIn,
    github,
    instagram
  } = profileData;

  const hasEmail = email && nonEmptyStr(email);
  const hasPersonalSite = personal_site && nonEmptyStr(personal_site);
  const hasAvatar = avatar && nonEmptyStr(avatar);
  const hasFacebookLink = facebook && nonEmptyStr(facebook);
  const hasTwitterLink = twitter && nonEmptyStr(twitter);
  const hasLinkedInLink = linkedIn && nonEmptyStr(linkedIn);
  const hasGithubLink = github && nonEmptyStr(github);
  const hasInstagramLink = instagram && nonEmptyStr(instagram);

  const renderCreateProfileButton = profileIsNone && address === myAddress &&
    <Link href={`/new-profile`}>
      <a style={{ marginTop: '.5rem', textAlign: 'initial' }} className={'ui button primary ' + BUTTON_SIZE}>
        <i className='plus icon' />
        Create profile
      </a>
    </Link>;

  const renderDropDownMenu = () => {
    const [open, setOpen] = useState(false);

    if (profileIsNone) return null;

    const close = () => setOpen(false);

    return (<Dropdown icon='ellipsis horizontal' direction='left'>
      <Dropdown.Menu>
        {<Link href={`/edit-profile`}><a className='item'>Edit</a></Link>}
        {edit_history.length > 0 && <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />}
        {open && <ProfileHistoryModal id={id} open={open} close={close} />}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const getName = () => {
    if (isEmptyStr(fullname) || isEmptyStr(username)) {
      return address;
    } else {
      return fullname || username.toString();
    }
  };

  const NameAsLink = () => (
    <Link href={`/profile?address=${address}`}>
      <a className='handle'>{getName()}</a>
    </Link>
  );

  const renderNameOnly = () => {
    return withLink
      ? <NameAsLink />
      : <>{getName()}</>;
  };

  const renderPreview = () => {
    return <div>
      <div className={`item ProfileDetails MyBlog`}>
        {hasAvatar
          ? <DfBgImg size={size} src={avatar} className='DfAvatar' rounded/>
          : <IdentityIcon className='image' value={address} size={size} />
        }
        <div className='content'>
          <div className='header DfProfileTitle'>
            <NameAsLink />
            {renderDropDownMenu()}
          </div>
          <MutedDiv className='DfScore'>Reputation: {reputation}</MutedDiv>
          {renderCreateProfileButton}
          <div className='about'>
            <div className='DfSocialLinks'>
              {hasEmail &&
                <a
                  href={`mailto:${email}`}
                  target='_blank'
                >
                  <Icon className='mail' />Email
                </a>
              }
              {hasPersonalSite &&
                <a
                  href={personal_site}
                  target='_blank'
                >
                  <Icon className='address card outline' />Personal Site
                </a>
              }
              {hasFacebookLink &&
                <a
                  href={facebook}
                  target='_blank'
                >
                  <Icon className='facebook' />Facebook
                </a>
              }
              {hasTwitterLink &&
                <a
                  href={twitter}
                  target='_blank'
                >
                  <Icon className='twitter' />Twitter
                </a>}
              {hasLinkedInLink &&
                <a
                  href={linkedIn}
                  target='_blank'
                >
                  <Icon className='linkedin' />LinkedIn
                </a>
              }
              {hasGithubLink &&
                <a
                  href={github}
                  target='_blank'
                >
                  <Icon className='github' />GitHub
                </a>
              }
              {hasInstagramLink &&
                <a
                  href={instagram}
                  target='_blank'
                >
                  <Icon className='instagram' />Instagram
                </a>
              }
            </div>
            <ReactMarkdown className='DfMd' source={about} linkTarget='_blank' />
          </div>
        </div>
      </div>
    </div>;
  };

  if (nameOnly) {
    return renderNameOnly();
  } else if (preview) {
    return renderPreview();
  }

  return <>
    <SeoHeads title={getName()} name={name} desc={about} image={avatar} />
    <Section>
      <div className='ui massive relaxed middle aligned list FullProfile'>
        {renderPreview()}
        <FollowAccountButton address={address} size={BUTTON_SIZE}/>
        <TxButton isBasic={true} isPrimary={false} size={BUTTON_SIZE} onClick={() => setFollowersOpen(true)} isDisabled={followers === 0}><Pluralize count={followers} singularText='Follower'/></TxButton>
        <TxButton isBasic={true} isPrimary={false} size={BUTTON_SIZE} onClick={() => setFollowingOpen(true)} isDisabled={following === 0}>{following} Following </TxButton>
      </div>
      {followersOpen && <AccountFollowersModal id={id} accountsCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers} singularText='Follower'/>} />}
      {followingOpen && <AccountFollowingModal id={id} accountsCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={'Following'} />}
    </Section>
  </>;
}

export default withMulti(
  Component,
  withAddressFromUrl,
  withCalls<Props>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'id', propName: 'socialAccountOpt' })
  ),
  withSocialAccount
);
