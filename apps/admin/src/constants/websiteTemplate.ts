import template1 from '../assets/templates/template1.jpg'
import template2 from '../assets/templates/template2.jpg'
import template3 from '../assets/templates/template3.png'

export enum WebsiteTemplate {
  Minimal = 'minimal',
  Vertical = 'vertical',
  Hero = 'hero',
  Barebone = 'barebone',
}

export const WebsiteTemplatePreview = {
  minimal: [template1],
  vertical: [template2],
  hero: [template3],
  barebone: [template1],
}

export const defaultThemeColor = '#5c95ff'
