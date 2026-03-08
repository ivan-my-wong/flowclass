import CodeGuide from '../../assets/docs/embedGuides/code'
import ElementorGuide from '../../assets/docs/embedGuides/elementor'
import ShopifyGuide from '../../assets/docs/embedGuides/shopify'
import SquarespaceGuide from '../../assets/docs/embedGuides/squarespace'
import WixGuide from '../../assets/docs/embedGuides/wix'
import WordpressGuide from '../../assets/docs/embedGuides/wordpress'
import { WebsiteBuilders } from '../../constants/externalSoftware'

const EmbedGuide = ({ type }: { type: string }): JSX.Element => {
  if (type === WebsiteBuilders.wordpress.name) {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <WordpressGuide />
      </div>
    )
  }
  if (type === WebsiteBuilders.elementor.name) {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <ElementorGuide />
      </div>
    )
  }
  if (type === WebsiteBuilders.squarespace.name) {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <SquarespaceGuide />
      </div>
    )
  }
  if (type === WebsiteBuilders.shopify.name) {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <ShopifyGuide />
      </div>
    )
  }
  if (type === WebsiteBuilders.wix.name) {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <WixGuide />
      </div>
    )
  }
  if (type === WebsiteBuilders.custom.name) {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <CodeGuide />
      </div>
    )
  }
  return <></>
}

export default EmbedGuide
