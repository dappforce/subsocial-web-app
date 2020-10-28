import React, { useState, useEffect } from 'react'
import { Form, Select, Tabs } from 'antd'
import Router, { useRouter } from 'next/router'
import BN from 'bn.js'
import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { getNewIdFromEvent, equalAddresses, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { PostExtension, PostUpdate, OptionId, OptionBool, OptionIpfsContent, IpfsContent } from '@subsocial/types/substrate/classes'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import { PostContent, PostData, PostExt } from '@subsocial/types'
import { registry } from '@subsocial/types/substrate/registry'
import { newLogger } from '@subsocial/utils'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import { Loading } from '../utils'
import NoData from '../utils/EmptyList'
import { Null } from '@polkadot/types'
import DfMdEditor from '../utils/DfMdEditor/client'
import SpacegedSectionTitle from '../spaces/SpacedSectionTitle'
import { withLoadSpaceFromUrl, CanHaveSpaceProps } from '../spaces/withLoadSpaceFromUrl'
import { UploadCover } from '../uploader'
import { getNonEmptyPostContent } from '../utils/content'
import messages from 'src/messages'
import { PageContent } from '../main/PageWrapper'
import { useKusamaContext } from '../kusama/KusamaContext'
import { AccountId, Balance } from '@polkadot/types/interfaces'
import { NameWithOwner } from '../profiles/address-views/Name'
import { InfoPanel, DescItem } from '../profiles/address-views/InfoSection'
import { formatBalance } from '@polkadot/util';
import Input from 'antd/lib/input/Input'

const { TabPane } = Tabs

const log = newLogger('EditPost')

const TITLE_MIN_LEN = 3
const TITLE_MAX_LEN = 100

const BODY_MAX_LEN = 100_000 // ~100k chars

const MAX_TAGS = 10

type Content = PostContent

type FormValues = Partial<Content & {
  spaceId: string,
  proposalIndex?: number
}>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps = CanHaveSpaceProps & {
  post?: PostData
  /** Spaces where you can post. */
  spaceIds?: BN[]
}

function getInitialValues ({ space, post }: FormProps): FormValues {
  if (space && post) {
    const spaceId = space.struct.id.toString()
    return { ...post.content, spaceId }
  }
  return {}
}

const RegularPostExt = new PostExtension({ RegularPost: new Null(registry) })

export function InnerForm (props: FormProps) {
  const { space, post } = props
  const [ form ] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()

  if (!space) return <NoData description='Space not found' />

  const spaceId = space.struct.id
  const initialValues = getInitialValues(props)

  console.log('INIT', initialValues)

  const tags = initialValues.tags || []

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    if (!post) {
      return [ spaceId, RegularPostExt, new IpfsContent(cid) ]
    } else {

      // TODO Update only changed values.

      const update = new PostUpdate({
        // If we provide a new space_id in update, it will move this post to another space.
        space_id: new OptionId(),
        content: new OptionIpfsContent(cid),
        hidden: new OptionBool(false) // TODO has no implementation on UI
      })
      return [ post.struct.id, update ]
    }
  }

  const fieldValuesToContent = (): Content =>
    getNonEmptyPostContent(getFieldValues() as Content)

  const pinToIpfsAndBuildTxParams = () => {

    // TODO pin to IPFS only if JSON changed.

    return getTxParams({
      json: fieldValuesToContent(),
      buildTxParamsCallback: newTxParams,
      setIpfsCid,
      ipfs
    })
  }

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = (txResult) => {
    const id = post?.struct.id || getNewIdFromEvent(txResult)
    id && goToView(id)
  }

  const goToView = (postId: BN) => {
    Router.push('/[spaceId]/posts/[postId]', `/${spaceId}/posts/${postId}`)
      .catch(err => log.error(`Failed to redirect to a post page. ${err}`))
  }

  const onBodyChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('body')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }

  return <>
    <DfForm form={form} initialValues={initialValues}>
      <Form.Item
        name={fieldName('title')}
        label='Post title'
        hasFeedback
        rules={[
          // { required: true, message: 'Post title is required.' },
          { min: TITLE_MIN_LEN, message: minLenError('Post title', TITLE_MIN_LEN) },
          { max: TITLE_MAX_LEN, message: maxLenError('Post title', TITLE_MAX_LEN) }
        ]}
      >
        <Input placeholder='Optional: A title of your post' />
      </Form.Item>

      <Form.Item
        name={fieldName('image')}
        label='Cover'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadCover onChange={onAvatarChanged} img={initialValues.image} />
      </Form.Item>

      <Form.Item
        name={fieldName('body')}
        label='Post'
        hasFeedback
        rules={[
          { required: true, message: 'Post body is required.' },
          { max: BODY_MAX_LEN, message: maxLenError('Post body', BODY_MAX_LEN) }
        ]}
      >
        <DfMdEditor onChange={onBodyChanged} />
      </Form.Item>

      <Form.Item
        name={fieldName('tags')}
        label='Tags'
        hasFeedback
        rules={[
          { type: 'array', max: MAX_TAGS, message: `You can use up to ${MAX_TAGS} tags.` }
        ]}
      >
        <Select
          mode='tags'
          placeholder="Press 'Enter' or 'Tab' key to add tags"
        >
          {tags.map((tag, i) =>
            <Select.Option key={i} value={tag} children={tag} />
          )}
        </Select>
      </Form.Item>

      <Form.Item
        name={fieldName('canonical')}
        label='Original URL'
        help='This is the orginal URL of the place you first posted about this on another social media platform (i.e. Medium, Reddit, Twitter, etc.)'
        hasFeedback
        rules={[
          { type: 'url', message: 'Should be a valid URL.' }
        ]}
      >
        <Input type='url' placeholder='URL of the original post' />
      </Form.Item>

      {/* // TODO impl Move post to another space. See component SelectSpacePreview */}

      <DfFormButtons
        form={form}
        txProps={{
          label: post
            ? 'Update post'
            : 'Create post',
          tx: post
            ? 'posts.updatePost'
            : 'posts.createPost',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    </DfForm>
  </>
}

type Proposal = {
  proposer: AccountId;
  value: Balance;
  beneficiary: AccountId;
  bond: Balance;
  id: number,
  status: 'pass' | 'active'
}

type KusamaProposalDescProps = {
  proposal: Proposal
}

const KusamaProposalDesc = ({ proposal: { proposer, beneficiary, value, bond, id, status } }: KusamaProposalDescProps) => {
  const isPass = status === 'pass'
  const commonItems: DescItem[] = [
    {
      label: 'Proposal index',
      value: id
    },
    {
      label: 'Status',
      value: status
    }
  ]

  const items: DescItem[] = isPass
    ? commonItems
    : [
      ...commonItems,
      {
        label: 'Proposer',
        value: <NameWithOwner address={proposer} />
      },
      {
        label: 'Requested amount',
        value: formatBalance(value)
      },
      {
        label: 'Beneficiary',
        value: <NameWithOwner address={beneficiary} />
      },
      {
        label: 'Requested bond',
        value: formatBalance(bond)
      }
    ]

  return <InfoPanel
    style={{ border: `1px solid ${isPass ? 'grey' : 'green'}`}}
    items={items}
    layout='horizontal'
    column={2}
  />
}

const createPassProposal = (proposalIndex: number): Proposal => ({ id: proposalIndex, status: 'pass' } as Proposal)

export const KusamaProposalForm = (props: FormProps) => {
  const { api } = useKusamaContext()
  const [ lastProposaCount, setCount ] = useState<number>()
  const [ proposalIndex, setIndex ] = useState<number>()
  const [ proposal, setProposal ] = useState<Proposal>()
  const [ form ] = Form.useForm()
  const initialValues = getInitialValues(props)

  useEffect(() => {
    if (!api) return

    api.query.treasury.proposalCount()
      .then(x => setCount(x.toNumber()))
  })

  useEffect(() => {
    if (!proposalIndex || !api) return

    const loadProposal = async () => {
      const proposalOpt = await api.query.treasury.proposals(proposalIndex)
      const treasuryProposal = proposalOpt.unwrapOr(undefined)

      const proposal: Proposal = treasuryProposal
        ? { ...treasuryProposal, status: 'active', id: proposalIndex }
        : createPassProposal(proposalIndex)

      if (props.post) {
        const ext: PostExt = { proposal: { proposalIndex, network: 'kusama' } }
        const content = props.post.content
        if (content) {
          content.ext = ext
        } else {
          props.post.content = { ext } as PostContent
        }
      }

      setProposal(proposal)

      console.log('PROPS', props.post?.content)
    }

    loadProposal().catch(console.error)
  })

  if (!lastProposaCount) return <Loading />

  return <>
      <DfForm form={form} initialValues={initialValues}>
        <Form.Item
          name='proposalIndex'
          label='Post proposal'
          hasFeedback
          rules={[
            { required: true, message: 'Proposal index is required.' },
            ({ getFieldValue }) => ({
              async validator () {
                const proposalIndex = getFieldValue('proposalIndex')
                console.log('INDEX', proposalIndex)
                const isValid = proposalIndex <= lastProposaCount
                if (isValid) {
                  setIndex(proposalIndex)
                  return Promise.resolve();
                }
                return Promise.reject(new Error(`Proposal is not exist, max proposal index: ${lastProposaCount}`));
              }
            })
          ]}
        >
          <Input placeholder='Proposal index' type='number' className='mt-3' />
        </Form.Item>
      </DfForm>
      {proposal && <>
        <KusamaProposalDesc proposal={proposal} />
        <InnerForm {...props} />
      </>}
  </>
}

export const PostForms = (props: FormProps) => {
  const { post } = props

  const defaultKey = (post?.content as any)?.proposal
    ? 'proposal'
    : 'regular'

  return <Tabs defaultActiveKey={defaultKey}>
    <TabPane tab='Regular post' key='regular'>
      <InnerForm {...props} />
    </TabPane>
    <TabPane tab='Kusama proposal' key='proposal'>
      <KusamaProposalForm {...props} />
    </TabPane>
  </Tabs>
}

export function FormInSection (props: FormProps) {
  const { space, post } = props
  const { apiState } = useKusamaContext()

  const isShowKusama = apiState && apiState !== 'ERROR'

  const pageTitle = post ? `Edit post` : `New post`

  const sectionTitle =
    <SpacegedSectionTitle space={space} subtitle={pageTitle} />

  return <PageContent>
    <HeadMeta title={pageTitle} />
    <Section className='EditEntityBox' title={sectionTitle}>
      {isShowKusama
        ? <PostForms {...props} />
        : <InnerForm {...props} />}
    </Section>
  </PageContent>
}

function LoadPostThenEdit (props: FormProps) {
  const { postId } = useRouter().query
  const myAddress = useMyAddress()
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ post, setPost ] = useState<PostData>()

  useSubsocialEffect(({ subsocial }) => {
    const load = async () => {
      if (typeof postId !== 'string') return

      setIsLoaded(false)
      const id = new BN(postId)
      setPost(await subsocial.findPost({ id }))
      setIsLoaded(true)
    }
    load()
  }, [ postId ])

  if (!isLoaded) return <Loading label='Loading the post...' />

  if (!post) return <NoData description='Post not found' />

  const postOwner = post.struct?.owner
  const isOwner = equalAddresses(myAddress, postOwner)
  if (!isOwner) return <NoData description='You do not have permission to edit this post' />

  return <FormInSection {...props} post={post} />
}

export const EditPost = withLoadSpaceFromUrl(LoadPostThenEdit)

export const NewPost = withLoadSpaceFromUrl(FormInSection)

export default NewPost
