import React, { useEffect, useRef, useState } from 'react'

import * as Dialog from '@radix-ui/react-dialog'
import useTranslation from 'next-translate/useTranslation'
import { IoClose } from 'react-icons/io5'

import Spinner from '../Loaders/Spinner'

// ... InAppBrowserProps interface remains the same
type InAppBrowserProps = {
  trigger: React.ReactElement
  status?: string
  url: string
  title?: string
}

const InAppBrowser: React.FC<InAppBrowserProps> = ({
  trigger,
  url,
  title,
  status,
}: InAppBrowserProps) => {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { t } = useTranslation()

  const parsedUrl = new URL(url)
  const parentDomain = new URL(window.location.href).hostname

  const [domain, setDomain] = useState<string | null>(parsedUrl.hostname)

  // const [history, setHistory] = useState<string[]>([])
  // const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0)

  const [proxyUrl, setProxyUrl] = useState<string>(
    `/proxy/${domain}${parsedUrl.pathname + parsedUrl.search}`
  )

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'navigation') {
        const newUrl = event.data.url
        const parsedNewUrl = new URL(newUrl)
        const pathAndSearch = `${parsedNewUrl.pathname}${parsedNewUrl.search}`

        if (newUrl.includes(parentDomain)) {
          return
        }

        if (!newUrl.includes('/proxy/')) {
          if (parsedNewUrl.hostname === domain || parsedNewUrl.hostname === parentDomain) {
            setProxyUrl(`/proxy/${domain}${pathAndSearch}`)
          } else {
            setProxyUrl(`/proxy/${parsedNewUrl.hostname}${pathAndSearch}`)
            setDomain(parsedNewUrl.hostname)
          }
        } else {
          setProxyUrl(pathAndSearch)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [domain, parentDomain])

  const injectNavigationScript = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const script = `
        (function() {
          const originalPushState = history.pushState;
          const originalReplaceState = history.replaceState;
          
          history.pushState = function() {
            originalPushState.apply(this, arguments);
            window.parent.postMessage({type: 'navigation', url: location.href}, '*');
          };
          
          history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            window.parent.postMessage({type: 'navigation', url: location.href}, '*');
          };
          
          window.addEventListener('popstate', function() {
            window.parent.postMessage({type: 'navigation', url: location.href}, '*');
          });
          
          const originalSubmit = HTMLFormElement.prototype.submit;
          HTMLFormElement.prototype.submit = function() {
            window.parent.postMessage({type: 'navigation', url: this.action}, '*');
            originalSubmit.apply(this);
          };

          // Initial URL
          window.parent.postMessage({type: 'navigation', url: location.href}, '*');
        })();
      `
      // Use Function constructor instead of eval
      const scriptFunction = new Function(script)
      iframeRef.current.contentWindow.setTimeout(scriptFunction, 0)
    }
  }

  const handleIframeLoad = () => {
    if (!iframeLoaded) {
      setIframeLoaded(true)
    }
    injectNavigationScript()
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlayColor z-modal fixed inset-0" />
        <Dialog.Content className="animate-popIn bg-background z-modalContent fixed left-1/2 top-1/2 h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-lg shadow-lg sm:h-[95vh]">
          <div className="flex h-full flex-col overflow-hidden rounded-lg">
            <div className="bg-backgroundLayer2 flex flex-col items-center gap-1 p-3">
              <div className="box-row-full items-center justify-between space-x-2">
                <Dialog.Title className="flex-grow text-sm font-medium">
                  {title || 'In-App Browser'}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    onClick={() => setIframeLoaded(false)}
                    aria-label="Close"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 transition-colors duration-200 hover:bg-red-600"
                  >
                    <IoClose className="text-white" size={20} />
                  </button>
                </Dialog.Close>
              </div>
              <div className="bg-background-layer-3 box-row-full items-center justify-start rounded-lg p-2">
                {/* <div className="flex flex-row gap-2">
                  <button
                    onClick={() => {
                      if (iframeRef.current) {
                        iframeRef.current.src = history[currentHistoryIndex - 2]
                        setCurrentHistoryIndex(currentHistoryIndex - 2)
                      }
                    }}
                    className={'bg-background-layer-2 rounded-md p-1'}
                    disabled={currentHistoryIndex === 0}
                  >
                    <FaChevronLeft
                      className={`${currentHistoryIndex > 0 ? 'text-primary' : 'text-subtle'}`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (iframeRef.current && currentHistoryIndex < history.length - 1) {
                        iframeRef.current.src = history[currentHistoryIndex]
                        setCurrentHistoryIndex(currentHistoryIndex)
                      }
                    }}
                    className={'bg-background-layer-2 rounded-md p-1'}
                    disabled={currentHistoryIndex === history.length - 1}
                  >
                    <FaChevronRight
                      className={`${
                        currentHistoryIndex < history.length - 1 ? 'text-primary' : 'text-subtle'
                      }`}
                    />
                  </button>
                </div> */}

                <p className="w-[60vw] break-words text-sm">{`https://${proxyUrl.replace(
                  '/proxy/',
                  ''
                )}`}</p>
              </div>
            </div>
            <div className="bg-background relative flex-grow overflow-y-auto">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={proxyUrl}
                className="bg-background h-full w-full border-none"
                onLoad={handleIframeLoad}
                style={{
                  display: iframeLoaded ? 'block' : 'none',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
                title="In-App Browser Content"
              />
            </div>
            {status && (
              <p className="bg-background-layer-2 w-full rounded-md p-2 text-left text-xs font-bold">
                {status.split('\n').map((line, index) => (
                  <>
                    {line}
                    {index < status.split('\n').length - 1 && <br />}
                  </>
                ))}
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default InAppBrowser
