/* eslint-disable react/no-unescaped-entities */
export default () => {
  return (
    <div>
      <div data-component-type="heading">
        <h3 id="adding-an-embed">Adding an embed</h3>
      </div>
      <div data-component-type="text">
        <div>
          <div>
            Add an embed to your site directly from the Add Elements panel. You
            can choose whether to add a code snippet to your site, or embed an
            external URL. &nbsp;
          </div>
        </div>
      </div>
      <div data-component-type="heading">
        <h4 id="">To add an embed to your site:</h4>
      </div>
      <div data-component-type="text">
        <div>
          <ol>
            <li>
              Click <strong>Add Elements</strong>{' '}
              <img
                data-composite="true"
                src="https://lh5.googleusercontent.com/oRY1B29VdHG5tcM7fbt-GgDlryjJ7myXYUhvJa_v8HV_jFhqoykh0-k8XFzKAhz_jXBfa-_rHJCxbRhdaWouwL2k3sYS4EmWBaxhf1PmuPDRnxAFOBBKL8d0VG5Dr2uUmIIg7H6yb00JcH6EmNy2-SuB6OMVKhBRM8tawQYQGsQ55XkwH54RmYlm"
                aria-hidden="true"
                alt="wix"
              />
              <strong> </strong>in your Editor.
            </li>{' '}
            <li>
              Click <strong>Embed Code</strong>.
            </li>{' '}
            <li>
              Click <strong>Popular Embeds</strong>.
            </li>{' '}
            <li>
              Choose the type of embed you want to add to your site:
              <ul>
                <li>
                  <strong>Embed HTML:</strong> Embed a code snippet to display a
                  widget on your site pages and set it up.
                </li>{' '}
                <li>
                  <strong>Embed a site:</strong> Display an external site in a
                  window on your page.
                </li>{' '}
              </ul>{' '}
            </li>{' '}
            <li>Click your chosen embed to add it to your site.</li>
          </ol>
        </div>
      </div>
      <div data-component-type="image">
        <div>
          <img
            id="2f10f92a-4465-4fe7-8385-09707b2494ce"
            src="https://d2x3xhvgiqkx42.cloudfront.net/12345678-1234-1234-1234-1234567890ab/651c25b0-2d60-43c8-addf-1df2fd575568/2022/10/24/be3f55c7-8169-4ad7-9ef2-75e44a1cbc09/f6dfe750-30ea-481f-88e3-ec1a724adc79.png"
            alt="The Code tab of the Add Elements panel in the Editor. HTML and site embeds are highlighted."
          />
        </div>
      </div>
      <div data-component-type="line">
        <hr />
      </div>
      <div data-component-type="heading">
        <h3 id="setting-up-an-embed">Setting up an embed</h3>
      </div>
      <div data-component-type="text">
        <div>
          <div>
            After you've added an embed, enter the relevant code snippet or URL
            to set it up and display sites and widgets to your visitors.
          </div>
        </div>
      </div>
      <div data-component-type="heading">
        <h4 id="">To enter the code / URL:</h4>
      </div>
      <div data-component-type="text">
        <div>
          <ol>
            <li>Click the embed in your Editor.</li>{' '}
            <li>
              Select the relevant option to enter the details:
              <ul>
                <li>
                  <strong>HTML:&nbsp;</strong>
                  <ol>
                    <li>
                      Click <strong>Enter Code</strong>.
                    </li>{' '}
                    <li>
                      Enter the snippet under{' '}
                      <strong>Add your code here</strong>.
                    </li>{' '}
                  </ol>{' '}
                </li>{' '}
                <li>
                  <strong>Site:</strong>&nbsp;
                  <ol>
                    <li>
                      Click <strong>Enter Website Address</strong>.
                    </li>{' '}
                    <li>
                      Enter the URL under{' '}
                      <strong>What's the website address?</strong>. For example,
                      if your Flowclass page is abcschool.example.com . Simply
                      enter the website into the box.
                    </li>{' '}
                  </ol>{' '}
                </li>{' '}
              </ul>{' '}
            </li>{' '}
            <li>
              Click <strong>Apply</strong> to save the snippet / URL.
            </li>{' '}
            <li>
              (Optional) Enter alt text for the embed under{' '}
              <strong>What's in the embed? Tell Google</strong>.
            </li>
          </ol>
        </div>
      </div>
      <div data-component-type="image">
        <div>
          <img
            id="4108881f-7b2f-4b04-8280-1a477fa8bb46"
            src="https://d2x3xhvgiqkx42.cloudfront.net/12345678-1234-1234-1234-1234567890ab/651c25b0-2d60-43c8-addf-1df2fd575568/2022/11/10/6836a7c9-bf33-48b9-8c55-8e927ac43827/782bf0c9-d923-44b3-9471-456ad8d36eee.png"
            alt=""
          />
        </div>
      </div>

      <div data-component-type="line">
        <hr />
      </div>
      <div data-component-type="heading">
        <h3 id="adjusting-the-sizing-of-the-displayed-content">
          Adjusting the sizing of the displayed content
        </h3>
      </div>
      <div data-component-type="text">
        <div>
          <div>
            Embedded elements often include pre-defined width and height in
            pixels, set by the service they were acquired from, as in the
            example below:&nbsp;
          </div>
        </div>
      </div>

      <div data-component-type="text">
        <div>
          <div>
            These settings could potentially crop the content if the iFrame
            container is smaller than 560 px * 315 px. To prevent this from
            happening, replace the px values with percentage units and set them
            to 100% as shown below:&nbsp;
          </div>
        </div>
      </div>

      <div data-component-type="informative">
        <div data-color="blue">
          <span>
            <strong>Note:</strong>
          </span>
          <span>
            <div>
              The HTML and URL elements in our Editor are frames. Therefore, the
              code or site you are embedding won’t be responsive, even if it is
              originally.
            </div>
          </span>
        </div>
      </div>
      <div data-component-type="line">
        <hr />
      </div>
      <div data-component-type="heading">
        <h3 id="guidelines-for-adding-embeds-to-your-site">
          Guidelines for adding embeds to your site
        </h3>
      </div>
      <div data-component-type="text">
        <div>
          <div>
            When embedding code or URL on your site, there are some important
            guidelines you should keep in mind in order to ensure that the
            element is displayed properly:
          </div>
        </div>
      </div>
      <div data-component-type="text">
        <div>
          <ul>
            <li>
              Always make sure the code you are embedding is up to date and
              HTML5 compatible. Most browsers don't display pages and scripts
              properly if they were written using older versions of HTML.&nbsp;
            </li>
          </ul>
        </div>
      </div>
      <div data-component-type="text">
        <div>
          <ul>
            <li>
              There is no character limit for the HTML and Embed a Site
              elements.&nbsp;
            </li>
          </ul>
        </div>
      </div>
      <div data-component-type="text">
        <div>
          <ul>
            <li>Your code must contain HTTPS and not HTTP.&nbsp;</li>
          </ul>
        </div>
      </div>
      <div data-component-type="text">
        <div>
          <ul>
            <li>
              HTML documents are described by HTML tags. HTML tags normally come
              in pairs like &lt;p&gt; and &lt;/p&gt;. The first tag in a pair is
              the start tag; the second tag is the end tag. This format of the
              tags is crucial for maintaining the structure of the page you are
              trying to embed.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
