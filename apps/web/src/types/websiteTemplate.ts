export enum WebsiteTemplate {
  Minimal = 'minimal',
  Vertical = 'vertical',
  Hero = 'hero',
  Barebone = 'barebone',
}

// TODO: Move into constants directories
export const tabs = ['basicInfo', 'courses', 'gallery']

export const templateTabs = ['basicInfo', 'courses']

export const heroTemplateTabs = ['', 'courses', 'contact']

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const templateSectionBgColor = (currentTheme: string): string => {
  // return 'bg-background'
  if (currentTheme == WebsiteTemplate.Hero || currentTheme == WebsiteTemplate.Vertical) {
    return 'bg-background'
  } else {
    return 'bg-background-layer-2'
  }
}
