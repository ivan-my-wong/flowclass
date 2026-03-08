import { TextVersion } from '@/types/settingWebpageInstitution'

// only store the translation that needs to be overridden
const versionedResources = {
  [TextVersion.EVENT]: {
    en: {
      component: {
        menubar: {
          headings: {
            courses: 'Events & Applications',
          },
          teachingService: 'Events',
          studentRecord: 'Participant Central',
          classSchedule: 'Event Schedule',
        },
        SectionTag: {
          SCHOOL_FACILITIES: 'About Us',
          SCHOOL_QUALIFICATION_AWARDS: 'Our Events',
          SCHOOL_SUPPORT: 'Organizer Support',
          COURSE_FEATURES: 'Event Highlights',
          COURSE_SYLLABUS: 'Event Features',
          COURSE_ENQUIRY: 'Event Enquiry',
        },
      },
      onboarding: {
        taskTitle: {
          centre: 'Personalize your event page',
          course: 'Create your event page to promote your events',
        },
        schoolSettings: {
          domain:
            'Choose a link for your event (which participants will use to access your page)',
          name: 'Choose a name for your event',
          logo: 'Upload a logo for your event',
          banner: 'Upload a banner for your event',
          contact: 'Fill in the contact information of your event',
          description:
            'Write a landing page description with at least 200 characters for your event',
          location: 'Fill in the location of your event',
        },
        courseSettings: {
          description:
            'Write a landing page description with at least 200 characters for your event',
          createCourse: 'Create your first event page',
          setPath: 'Set a link for your event registration page',
          setPrice: 'Set a price for your event',
          setSchedule: 'Set the schedule of the coming month for your event',
          publishCourse: 'Publish your event to make it available to the world',
        },
      },
      pricingPlan: {
        quotas: {
          currentActiveStudents: 'Current number of active participants',
        },
      },
      school: {
        tourStep: {
          welcomeContent:
            'You are only a few steps away from unlocking the full potential of Flowclass. Follow these easy steps to build your event landing page.',
          floatingContent:
            'This menu will provide instructions on the necessary steps required to complete your event profile',
          name: 'This will be the name of your event that appears on the navigation bar on every webpage.',
          banner:
            "Upload a 21:9 banner image to showcase your event. If you don't have one, we can help create one for you.",
          descriptionTab:
            'The description of your event is an essential part of your Flowclass site. It will be displayed on your event homepage, making it the first thing potential participants see when visiting your site',
          textEditor:
            "You can provide your participants with more information by including images or videos. We've provided a text editor with options to stylize your text. ",
          contactTab:
            'Contact is the way for participants to communicate with you',
          galleryColumn:
            "Showcase your event with images. We've suggested a few categories of photos you can upload to impress your participants.",
          congratulationsContent:
            'You have completed the tour on how to create a homepage. Now, you can quickly create your first events and start your event brand',
          contact:
            'Participants need your primary contact number and email to enquire for your events. They will be shown in the "Event enquiry" section as well as the footer of every page.',
          contact2:
            "We set it up so participants can Whatsapp your phone number directly. If you're not comfortable, it's also okay to provide your email address.",
          address:
            'If you have a physical location, fill in the address here so participants know where they will attend the event types.',
        },
        basic: {
          schoolBranding: 'Branding',
          schoolName: 'Name of your event',
          schoolNameDescription:
            'This name will be displayed on the website header, in the search results, and all emails sent to participants. It should be the official name of your event',
          website: 'Enter your event alias',
          previewWebsite: 'Your event website link will be',
        },
        task: {
          title:
            'To build an attractive event profile, complete the following tasks:',
          schoolName: 'Give your event a name',
          schoolLogo: 'Upload your event logo',
          schoolBanner: 'Upload your event banner',
          schoolDescription: 'Describe your event with pre-set sections',
          schoolPhone: 'Provide your event phone number',
          schoolEmail: 'Provide your event email address',
          schoolAddress: 'Provide your event address',
          schoolGallery:
            'Upload at least 3 images of your event to your gallery',
        },
        hints: {
          school: {
            SCHOOL_FACILITIES:
              "Clearly stating the event's purpose, vision and mission.",
            SCHOOL_QUALIFICATION_AWARDS:
              'Showcase your events, and unique offerings that set your event apart.',
            SCHOOL_SUPPORT:
              'Provide information about your organizer support services, including contact methods, event hours, after-event service, technical support, and any other assistance you offer to your participants.',
            SCHOOL_FAQS:
              'Include common questions about your events, or event operations. Consider addressing pricing, delivery, warranty, or usage-related inquiries that participants frequently ask.',
          },
          course: {
            COURSE_FEATURES:
              'Give a brief on the key highlights of the event to pique the interest of participants',
            COURSE_SYLLABUS: 'Detail all the features of the event',
          },
        },
        gallery: {
          imageTag: {
            environment: 'Environment',
            student: 'Participants',
            courseReview: 'Event Review',
            teacherQualification: 'Promotion',
          },
        },
        contact: {
          details:
            'Participants will contact you through the following information for enquiries.',
          addressTips:
            'Your address will be public on the website. If you are an online event, you can skip this section.',
        },
      },
      setting: {
        customizeSite: {
          description:
            'This will be the link your participants will use to access your site. If you change it, the participants will not be able to access using the old link.',
        },
        studentInformation: {
          notification:
            'Custom data fields are used to store information of a participant into their profile. These fields can be used to create application forms for participants to fill in when they are applying for an event.',
        },
        applicationForm: {
          descriptionCreate:
            'For your eyes only and will not be shown to participants.',
        },
        additionalFee: {
          additionalFeeDisplay:
            'The name of the additional fee will be displayed to participants',
          compulsory: 'New participant registration fee',
        },
        userManagement: {
          selectSchool: 'Select event',
          inviteOthers:
            'You can invite other colleagues or participants to join your site, and they can help you manage payments and events.',
          inviteNewUserSchool: 'Invite User to Event',
          noUsers: "You don't have any users for this event yet.",
        },
      },
      teachingService: {
        allCourses: 'All events',
        createCourse: 'Create event',
        unnamedCourse: 'Unnamed Event',
        alert: 'You must publish the event to view the event page.',
        noCourse:
          'You have no events yet. Create your first event to start getting applications',
        noSchool:
          'You currently do not have an event or are experiencing an error. Please create a new event to continue.',
        class: {
          name: 'Name of Event Type',
          selectClass: 'Select type',
          tuition: 'Price',
          quota: 'Quota',
          noClassYet:
            "You don't have any event types yet. Creating an event type allows you to create different variations of your event.",
          createClass: 'Create event type',
          numOfLessons: 'No. of sessions',
          priceForClass: 'Set as total price of event',
          schedule: 'List of Time Slots',
          minimumPurchaseLesson:
            'Every participant must purchase at all sessions in a period at the same time. If a period has 4 sessions, the participant will have to purchase 4 sessions at least',
          durationPerLesson: 'Duration per session',
          addLesson: 'Add Single Session',
          addMultipleLessons: 'Add Multiple Sessions',
          dropInTitle: 'Allow joining in the middle of a session (Drop In)',
          dropInDescription:
            'Enable participants to join an ongoing session at any point during the event period. The system will automatically adjust and calculate the event fee based on the number of remaining sessions',
          multipleClassesTitle: 'Multiple Sessions',
          multipleClassesDescription:
            'Allow participants to apply for this session together with other sessions.',
        },
        feeNTime: {
          tuitionPerLesson: 'Price per session',
          tuitionPerClass: 'Cost for entire event type',
        },
        course: {
          selectCourse: 'Select event',
          selectClass: 'Select event type',
        },
        createCourseModal: {
          title: 'Create new event page',
          textInput: 'You will be creating a page for your new',
          successCreate:
            'The event has been created. You can start to edit it.',
          name: 'Event name',
        },
        view: {
          viewSite: 'View event page',
          courseLink: 'The link to your event page will be',
          applicationLink: 'The link to your event type page will be',
        },
        courseTabLabel: {
          class: 'Event Type/Options ',
        },
        tourStep: {
          name: 'This will be the name of your event that appears on the navigation bar and during the registration steps.',
          path: "This will be the link to access your event page. This part will be the link after 'yourdomain/@/'. Make sure it's easy to remember.",
          previewImage:
            "Upload a 21:9 banner to showcase your event. If you don't have any banner designs, we can help you.",
          classColumn:
            'Here is the list of event types you have created. An event type corresponds to a specific schedule.',
          className:
            'The event type name should be a short description of the schedule of your session. For example, "9:00AM Yoga Session", or a "Biweekly event". The participants see this to choose which schedule they want to enroll in.',
          classTuition:
            'Set the price per session for this event type. Our system will automatically multiply this by the number of sessions participants apply for to determine the total fee. If you only have the price of the entire package of event type, simply divide the total price by the number of sessions.',
          classQuota:
            'This will be the maximum number of participants that can enroll in this event type. Afterwards, participants must contact you first if they are interested.',
          classSchedule:
            'Here you can define exactly the time of your sessions. We also made it easy for you to add multiple sessions that are within a single period. One period should correspond to an entire series of sessions within the event. We recommend you to name your phases according to the time of the period. For example, "August Package" or "Winter Session".',
          classCalendar:
            'You can view the calendar of all the sessions of your event type here.',
        },
        tag: {
          createCourseTag: 'Event tags',
          description:
            'A tag is a custom label that you assign to the event. You can create tags to identify the event.',
        },
        task: {
          title: 'How to create a complete Event?',
          courseName: 'Give your event a name',
          coursePreviewImage: 'Upload your event preview image',
          coursePath: 'Provide a path for your event',
          courseDescription: 'Describe your event in around 200 words',
          courseRegistrationMessage: 'Provide a brief registration message',
          coursePublish: 'Publish your event',
          regularDetail: 'Create an event type',
        },
        basic: {
          name: 'Event name',
        },
        courseDescription: {
          regular:
            'Each event type will have a fixed number of sessions that participants can apply to. All sessions will end their registration period at the same time',
          workshop:
            'One-time events with one or more timeslots. Will not repeat. Suitable for promotional events and trials',
          recurring:
            'Never-ending schedule that repeats on the same day every week. Allows participants to join at any week',
          subscription:
            'Simple setup. No timeslot settings required. Participants will be charged periodically. Fit for membership or subscription-based events',
        },
        subscriptionSetting: {
          productName: 'Event name',
        },
        additionalFee: {
          editReminder:
            'Editing an existing fee will affect all other events added',
        },
        message: {
          registrationMessage:
            'This message will be displayed on the page when a participant register for your event.',
        },
        prerequisites: {
          courseIsRequired: 'Event is required',
          classIsRequired: 'Event type is required',
        },
        tabBar: {
          class: 'Event Type/Options ',
        },
      },
      student: {
        studentTable: 'Participant Central',
        createStudent: 'Create Participant',
        importCsv: {
          title: 'Import Data',
          fields: {
            StudentName: 'Participant Name',
            StudentEmail: 'Participant Email',
            StudentPhone: 'Participant Phone',
            CourseName: 'Event Name',
            ClassName: 'Event Type Name',
          },
          tutorialSelectField: {
            line1:
              "These three fields are compulsory for mapping participant's personal information.",
            line2:
              'Please specify the relationship and correspondence of columns in the csv file and participant information fields in your Flowclass participant database.',
            line3:
              'If the email and phone of a participant already exist in the database, no new participant record will be created. However, you can still assign custom data fields to the user in the next step.',
            line4:
              'If the phone number of a participant already exist in the database but the email is different, a new participant record will be created.',
          },
        },
        teachingService: {
          addStudentWithOptionalCourse: 'Create Participant Profile',
          enterFee: 'Event Fee',
          chooseCourse: 'Choose event',
          chooseClass: 'Choose event type',
          firstLessonDateTime: 'Session date time',
        },
      },
      promotion: {
        teachingServiceOption1: 'The coupon is applicable to all events',
        teachingServiceOption2:
          'The coupon is ONLY applicable to the selected events',
        teachingService: 'Event',
      },
      whatsappTemplate: {
        notYetReady:
          'We will be releasing a feature to let you automate sending out reminder WhatsApp messages to your participants. You can create your message templates first.',
      },
      embed: {
        configuration: {
          setWidthHeightCourse:
            'Please select the event you want to link to, and then set the width and height of the widget:',
        },
      },
      subscription: {
        limit: {
          maxOfActiveStudents: 'Max No. of Active Participants',
        },
        unused: {
          maxOfTotalStudents: 'Max No. of Total Participants',
          maxOfTotalClasses: 'Max No. of Event Types',
        },
      },
      lessonDateTime: {
        selectCourse: 'Select event',
        selectClass: 'Select event type',
      },
      common: {
        entity: {
          classes: 'Event Types',
        },
      },
    },
    zh: {
      component: {
        menubar: {
          headings: {
            courses: '活動與申請',
          },
          teachingService: '活動',
          studentRecord: '參與者中心',
          classSchedule: '活動時間表',
          blockTime: '閉館時間',
        },
        SectionTag: {
          SCHOOL_FACILITIES: '關於我們',
          SCHOOL_QUALIFICATION_AWARDS: '我們的活動',
          SCHOOL_SUPPORT: '主辦方支援',
          COURSE_FEATURES: '活動亮點',
          COURSE_SYLLABUS: '活動功能',
          COURSE_ENQUIRY: '活動查詢',
        },
      },
      onboarding: {
        taskTitle: {
          centre: '個人化你的活動頁面',
        },
        schoolSettings: {
          domain: '選擇一個連結，參與者將使用它來前往您的頁面',
          name: '選擇一個名稱，以吸引更多參與者',
          logo: '上傳您的活動Logo',
          banner: '上傳您的活動Banner',
          contact: '填入活動聯絡資訊',
          description: '寫一個至少200個字元的活動頁面描述，以吸引更多參與者',
          location: '填入活動地址',
        },
        courseSettings: {
          description: '寫一個至少200個字元的活動描述，以吸引更多參與者',
        },
      },
      pricingPlan: {
        quotas: {
          currentActiveStudents: '當前活躍參與者數量',
        },
      },
      school: {
        tourStep: {
          welcomeContent:
            '只需幾個簡單步驟，您就能充分發揮 Flowclass 的潛力。按照以下步驟來建立您的活動主頁。',
          floatingContent: '此選單將提供完成活動資料所需步驟的說明',
          name: '這將是您的活動名稱，會顯示在每個網頁的導航欄上。',
          banner:
            '上傳一張 21:9 的橫幅圖片來展示您的活動。如果您沒有合適的圖片，我們可以幫您製作。',
          descriptionTab:
            '活動描述是您 Flowclass 網站的重要組成部分。它將顯示在您的活動主頁上，是潛在參與者前往您網站時看到的第一個內容',
          textEditor:
            '您可以通過添加圖片或視頻為參與者提供更多信息。我們提供了一個文本編輯器，讓您能夠美化文字樣式。',
          contactTab: '聯絡方式是參與者與您溝通的橋樑',
          galleryColumn:
            '通過圖片展示您的活動。我們建議了幾個圖片類別，讓您上傳照片以打動參與者。',
          congratulationsContent:
            '您已完成創建主頁的導覽。現在，您可以快速創建第一個活動並開始您的品牌之旅',
          contact:
            '參與者需要您的主要聯絡電話和電子郵件來查詢您的活動。這些信息將顯示在「活動查詢」部分以及每個頁面的頁腳中。',
          contact2:
            '我們設置了讓參與者可以直接通過 WhatsApp 聯繫您的電話號碼。如果您不太習慣，也可以只提供電子郵件地址。',
          address:
            '如果您有實體地點，請在此填寫地址，讓參與者知道他們將在哪裡參與活動。',
        },
        basic: {
          schoolBranding: '品牌形象',
          schoolName: '活動名稱',
          schoolNameDescription:
            '此名稱將顯示在網站標題、搜尋結果中以及發送給參與者的所有電子郵件中。應為活動的正式名稱',
          website: '輸入您的活動別名',
          previewWebsite: '您的活動網站連結將是',
        },
        task: {
          title: '要建立一個吸引人的活動檔案，請完成以下任務：',
          schoolName: '為您的活動命名',
          schoolLogo: '上傳活動標誌',
          schoolBanner: '上傳活動橫幅',
          schoolDescription: '使用預設部分描述您的活動',
          schoolPhone: '提供活動電話號碼',
          schoolEmail: '提供活動電子郵件',
          schoolAddress: '提供活動地址',
          schoolGallery: '在相簿中上傳至少3張您的活動照片',
        },
        hints: {
          school: {
            SCHOOL_FACILITIES: '清楚闡述活動的目的、使命和願景。',
            SCHOOL_QUALIFICATION_AWARDS: '展示您的活動和獨特的優勢。',
            SCHOOL_SUPPORT:
              '提供有關您的主辦方支援服務資訊，包括聯絡方式、活動時間、售後服務、技術支援，以及其他為參與者提供的協助。',
            SCHOOL_FAQS:
              '包含關於您的活動或運營的常見問題。建議涵蓋參與者經常詢問的定價、配送、保固或使用相關問題。',
          },
          course: {
            COURSE_FEATURES:
              '清楚闡述活動的主要目標和目的。參與者完成後能達到什麼成就或學到什麼？',
            COURSE_SYLLABUS: '提供活動的詳細大綱，讓參與者清楚了解活動內容。',
          },
        },
        gallery: {
          imageTag: {
            environment: '環境',
            student: '參與者',
            courseReview: '活動評價',
            teacherQualification: '推廣',
          },
        },
        contact: {
          details: '參與者將通過以下信息與您聯繫以進行查詢。',
          addressTips:
            '您的地址將公開在網站上。如果您是線上活動，可以跳過此部分。',
        },
      },
      setting: {
        customizeSite: {
          description:
            '這將是客戶將使用的連結，如果您更改它，客戶將無法使用舊連結前往您的網站。',
        },
        studentInformation: {
          notification:
            '自定義數據字段用於存儲客戶的信息。這些字段可用於為客戶創建申請表單，以便他們在申請服務時填寫。',
        },
        applicationForm: {
          descriptionCreate: '僅供您查看，不會顯示給客戶。',
        },
        additionalFee: {
          additionalFeeDisplay:
            '額外費用名稱將顯示給客戶，以便他們了解他們需要支付的費用。',
          compulsory: '新客戶註冊費用',
        },
        userManagement: {
          selectSchool: '選擇事業',
          inviteOthers:
            '您可以邀請其他同事或客戶加入您的網站，他們可以幫助您管理付款和服務。',
          inviteNewUserSchool: '邀請用戶到事業',
          noUsers: '您目前沒有任何用戶在這個事業。',
        },
      },
      teachingService: {
        allCourses: '所有服務',
        createCourse: '創建服務',
        unnamedCourse: '未命名服務',
        alert: '您必須發佈服務才能查看服務頁面。',
        noCourse: '您目前沒有服務，請創建您的第一個服務以開始接收申請。',
        noSchool: '您目前沒有商業頁面或遇到錯誤。請創建新的商業頁面以繼續。',
        class: {
          name: '服務名稱',
          selectClass: '選擇服務類型',
          tuition: '價格',
          quota: 'Quota',
          noClassYet:
            '您目前沒有服務類型，創建服務類型允許您創建不同版本的服務。',
          createClass: '創建服務類型',
          numOfLessons: '活動數量',
          priceForClass: '設定為服務總價',
          schedule: '活動時間表',
          minimumPurchaseLesson:
            '每個客戶必須在每個時段購買至少一個服務。如果一個時段有4個服務，客戶必須購買至少4個服務。',
          durationPerLesson: '每個服務的時間長度',
          addLesson: '添加單個服務',
          addMultipleLessons: '添加多個服務',
          dropInTitle: '允許在服務中間加入 (Drop In)',
          dropInDescription:
            '允許客戶在服務中間加入。系統將自動調整並計算服務費用，根據剩餘的服務數量',
          multipleClassesTitle: '多個服務',
          multipleClassesDescription: '允許客戶與其他服務一起報名這個服務。',
        },
        feeNTime: {
          freeLesson: '免費',
          sendEmailQuestion: '發送電子郵件給客戶？',
          tuitionPerLesson: '每個服務的價格',
          tuitionPerClass: '整個服務類型的價格',
        },
        course: {
          selectCourse: '選擇服務',
          selectClass: '選擇服務類型',
        },
        createCourseModal: {
          title: '創建新服務頁面',
          textInput: '您將創建一個新服務的頁面',
          successCreate: '服務已成功創建。您可以開始編輯它。',
          name: '服務名稱',
        },
        view: {
          viewSite: '查看服務頁面',
          courseLink: '服務頁面的連結將是',
          applicationLink: '服務類型的頁面連結將是',
        },
        courseTabLabel: {
          class: 'Service Type/Options ',
        },
        tourStep: {
          name: '這將是您的服務名稱，將出現在導航欄和申請步驟中。',
          path: "這將是您服務頁面的連結。這部分將是 'yourdomain/@/' 之後的連結。確保它容易記憶。",
          previewImage:
            '上傳一張 21:9 的橫幅圖片來展示您的服務。如果您沒有合適的圖片，我們可以幫您製作。',
          classColumn:
            '這裡是您創建的服務類型列表。一個服務類型對應一個特定的時段。',
          className:
            '服務類型名稱應該是您課程時段的簡短描述。例如，"週一早上8:00的瑜伽課"，或"每兩週的初學者課程"。客戶看到這個來選擇他們想要註冊的時段。',
          classTuition:
            '設定每個服務的價格。系統將自動乘以客戶申請的服務數量來確定總費用。如果您只有整個服務類型的價格，只需將總價格除以服務數量。',
          classQuota:
            '這將是客戶可以註冊的最大數量。之後，客戶必須先聯繫您，如果他們有興趣。',
          classSchedule:
            '這裡您可以定義您的課程的確切時間。我們也讓您輕鬆添加多個課程，這些課程都在同一時間框架內。一個時段應該對應一個完整的課程系列。我們建議您根據時段的時間來命名您的時段。例如，"八月套餐"或"冬季課程"。',
          classCalendar: '您可以在此查看您的服務類型的所有課程的日曆。',
        },
        tag: {
          createCourseTag: '服務標籤',
          description:
            '標籤是您分配給服務的自訂標籤。您可以創建標籤以識別服務。',
        },
        task: {
          title: '如何創建完整的服務？',
          courseName: '為您的服務命名',
          coursePreviewImage: '上傳您的服務預覽圖片',
          coursePath: '提供服務的路徑',
          courseDescription: '在200個字元內描述您的服務',
          coursePublish: '發佈您的服務',
          regularDetail: '創建一個課程',
        },
        basic: {
          name: '服務名稱',
        },
        courseDescription: {
          regular:
            '每個服務類型將有固定數量的課程，用戶可以申請。所有服務將在同一時間結束申請期',
          workshop:
            '一次性的活動，具有一個或多個時段。不會重複。適合用於促銷活動和試用',
          recurring: '永遠重複的時間表，每週在同一天重複。允許客戶在任何週加入',
          subscription:
            '簡單的設定。不需要時段設定。客戶將定期收費。適合會籍或訂閱式服務',
        },
        subscriptionSetting: {
          productName: '服務名稱',
        },
        additionalFee: {
          editReminder: '編輯現有費用將影響所有其他添加的服務',
        },
        message: {
          registrationMessage: '這則訊息將在客戶註冊您的服務時顯示在頁面上。',
        },
        prerequisites: {
          courseIsRequired: '服務是必填的',
          classIsRequired: '服務類型是必填的',
        },
        tabBar: {
          class: '服務類型/選項',
        },
      },
      student: {
        studentTable: '客戶中心',
        createStudent: '創建客戶',
        importCsv: {
          title: '匯入客戶資料',
          fields: {
            StudentName: '客戶名稱',
            StudentEmail: '客戶電子郵件',
            StudentPhone: '客戶電話號碼',
            CourseName: '服務名稱',
            ClassName: '服務類型名稱',
          },
          tutorialSelectField: {
            line1: '這三個欄位是必須的，用於映射客戶的個人信息。',
            line2: '請指定csv文件和客戶信息欄位之間的關係和對應。',
            line3:
              '如果客戶的電子郵件和電話號碼已經存在於資料庫中，則不會創建新的客戶記錄。然而，您仍然可以在下一步中分配自定義數據欄位。',
            line4:
              '如果客戶的電話號碼已經存在於資料庫中但電子郵件不同，則會創建新的客戶記錄。',
          },
        },
        teachingService: {
          addStudentWithOptionalCourse: '創建客戶檔案',
          enterFee: '服務費用',
          chooseCourse: '選擇服務',
          chooseClass: '選擇服務類型',
          firstLessonDateTime: '日期時間',
        },
      },
      promotion: {
        teachingServiceOption1: '此優惠券適用於所有服務',
        teachingServiceOption2: '此優惠券僅適用於選定的服務',
        teachingService: '服務',
      },
      whatsappTemplate: {
        notYetReady:
          '我們將發布一個功能，讓您自動發送提醒 WhatsApp 消息給您的客戶。您可以先創建您的消息模板。',
      },
      embed: {
        configuration: {
          setWidthHeightCourse:
            '請選擇您要連結的服務，然後設定小部件的寬度和高度：',
        },
      },
      subscription: {
        limit: {
          maxOfActiveStudents: '最大活躍客戶數',
        },
        unused: {
          maxOfTotalStudents: '最大客戶數',
          maxOfTotalClasses: '最大服務類型數',
        },
      },
      lessonDateTime: {
        selectCourse: '選擇服務',
        selectClass: '選擇服務類型',
      },
      common: {
        entity: {
          classes: '服務類型',
        },
      },
    },
  },
  [TextVersion.SERVICE]: {
    en: {
      component: {
        menubar: {
          headings: {
            courses: 'Services & Applications',
          },
          teachingService: 'Services',
          studentRecord: 'Customer Central',
          classSchedule: 'Service Schedule',
        },
        SectionTag: {
          SCHOOL_FACILITIES: 'About Us',
          SCHOOL_QUALIFICATION_AWARDS: 'Our Services',
          SCHOOL_SUPPORT: 'Company Support',
          COURSE_FEATURES: 'Service Highlights',
          COURSE_SYLLABUS: 'Service Features',
          COURSE_ENQUIRY: 'Service Enquiry',
        },
      },
      onboarding: {
        taskTitle: {
          centre: 'Personalize your business page',
          course: 'Create your business page to promote your services',
        },
        schoolSettings: {
          domain:
            'Choose a link for your business (which customers will use to access your page)',
          name: 'Choose a name for your business',
          logo: 'Upload a logo for your business',
          banner: 'Upload a banner for your business',
          contact: 'Fill in the contact information of your business',
          description:
            'Write a landing page description with at least 200 characters for your business',
          location: 'Fill in the location of your business',
        },
        courseSettings: {
          description:
            'Write a landing page description with at least 200 characters for your events',
          createCourse: 'Create your first event page',
          setPath: 'Set a link for your event enrollment page',
          setPrice: 'Set a price for your event',
          setSchedule: 'Set the schedule of the coming month for your event',
          publishCourse: 'Publish your event to make it available to the world',
        },
      },
      pricingPlan: {
        quotas: {
          currentActiveStudents: 'Current number of active customers',
        },
      },
      school: {
        tourStep: {
          welcomeContent:
            'You are only a few steps away from unlocking the full potential of Flowclass. Follow these easy steps to build your business landing page.',
          floatingContent:
            'This menu will provide instructions on the necessary steps required to complete your company profile',
          name: 'This will be the name of your brand that appears on the navigation bar on every webpage.',
          banner:
            "Upload a 21:9 banner image to showcase your brand. If you don't have one, we can help create one for you.",
          descriptionTab:
            'The description of your business is an essential part of your Flowclass site. It will be displayed on your branding homepage, making it the first thing potential customers see when visiting your site',
          textEditor:
            "You can provide your customers with more information by including images or videos. We've provided a text editor with options to stylize your text. ",
          contactTab:
            'Contact is the way for customers to communicate with you',
          galleryColumn:
            "Showcase your business with images. We've suggested a few categories of photos you can upload to impress your customers.",
          congratulationsContent:
            'You have completed the tour on how to create a homepage. Now, you can quickly create your first services and start your business brand',
          contact:
            'Customers need your primary contact number and email to enquire for your services. They will be shown in the "Service enquiry" section as well as the footer of every page.',
          contact2:
            "We set it up so customers can Whatsapp your phone number directly. If you're not comfortable, it's also okay to provide your email address.",
          address:
            'If you have a physical location, fill in the address here so customers know where they will attend the service types.',
        },
        basic: {
          schoolBranding: 'Branding',
          schoolName: 'Name of your company',
          schoolNameDescription:
            'This name will be displayed on the website header, in the search results, and all emails sent to clients. It should be the official name of your company',
          website: 'Enter your company alias',
          previewWebsite: 'Your company website link will be',
        },
        task: {
          title:
            'To build an attractive company profile, complete the following tasks:',
          schoolName: 'Give your company a name',
          schoolLogo: 'Upload your company logo',
          schoolBanner: 'Upload your company banner',
          schoolDescription: 'Describe your company with pre-set sections',
          schoolPhone: 'Provide your company phone number',
          schoolEmail: 'Provide your company email address',
          schoolAddress: 'Provide your company address',
          schoolGallery:
            'Upload at least 3 images of your offerings to your gallery',
        },
        hints: {
          school: {
            SCHOOL_FACILITIES:
              "Clearly stating the company's purpose, vision and mission.",
            SCHOOL_QUALIFICATION_AWARDS:
              'Showcase your services, and unique offerings that set your company apart.',
            SCHOOL_SUPPORT:
              'Provide information about your customer support services, including contact methods, business hours, after-sales service, technical support, and any other assistance you offer to your customers.',
            SCHOOL_FAQS:
              'Include common questions about your services, or business operations. Consider addressing pricing, delivery, warranty, or usage-related inquiries that customers frequently ask.',
          },
          course: {
            COURSE_FEATURES:
              'Give a brief on the key highlights of the service to pique the interest of customers',
            COURSE_SYLLABUS: 'Detail all the features of the service',
          },
        },
        gallery: {
          imageTag: {
            environment: 'Environment',
            student: 'Services',
            courseReview: 'Service Review',
            teacherQualification: 'Promotion',
          },
        },
        contact: {
          details:
            'Customers will contact you through the following information for enquiries.',
          addressTips:
            'Your address will be public on the website. If you are an online service, you can skip this section.',
        },
      },
      setting: {
        customizeSite: {
          description:
            'This will be the link your customers will use to access your site. If you change it, the customers will not be able to access using the old link.',
        },
        studentInformation: {
          notification:
            'Custom data fields are used to store information of a customer into their profile. These fields can be used to create application forms for customers to fill in when they are applying for a service.',
        },
        applicationForm: {
          descriptionCreate:
            'For your eyes only and will not be shown to clients.',
        },
        additionalFee: {
          additionalFeeDisplay:
            'The name of the additional fee will be displayed to clients',
          compulsory: 'New customer registration fee',
        },
        userManagement: {
          selectSchool: 'Select business',
          inviteOthers:
            'You can invite other colleagues or customers to join your site, and they can help you manage payments and services.',
          inviteNewUserSchool: 'Invite User to Business',
          noUsers: "You don't have any users for this business yet.",
        },
      },
      teachingService: {
        allCourses: 'All services',
        createCourse: 'Create service',
        unnamedCourse: 'Unnamed Service',
        alert: 'You must publish the service to view the service page.',
        noCourse:
          'You have no services yet. Create your first service to start getting applications',
        noSchool:
          'You currently do not have a business service or are experiencing an error. Please create a new business service to continue.',
        class: {
          name: 'Name of Service Type',
          selectClass: 'Select type',
          tuition: 'Price',
          quota: 'Quota',
          noClassYet:
            "You don't have any service types yet. Creating a service type allows you to create different variations of your service.",
          createClass: 'Create service type',
          numOfLessons: 'No. of sessions',
          priceForClass: 'Set as total price of service',
          schedule: 'List of Time Slots',
          minimumPurchaseLesson:
            'Every customer must purchase at all sessions in a period at the same time. If a period has 4 sessions, the customer will have to purchase 4 sessions at least',
          durationPerLesson: 'Duration per session',
          addLesson: 'Add Single Session',
          addMultipleLessons: 'Add Multiple Sessions',
          dropInTitle: 'Allow joining in the middle of a session (Drop In)',
          dropInDescription:
            'Enable customers to join an ongoing session at any point during the service period. The system will automatically adjust and calculate the service fee based on the number of remaining sessions',
          multipleClassesTitle: 'Multiple Sessions',
          multipleClassesDescription:
            'Allow users to apply for this session together with other sessions.',
        },
        feeNTime: {
          sendEmailQuestion: 'Send notifications to client?',
        },
        course: {
          selectCourse: 'Select service',
          selectClass: 'Select service type',
        },
        createCourseModal: {
          title: 'Create new service page',
          textInput: 'You will be creating a page for your new',
          successCreate:
            'The service has been created. You can start to edit it.',
          name: 'Service name',
        },
        view: {
          viewSite: 'View service page',
          courseLink: 'The link to your service page will be',
          applicationLink: 'The link to your service type page will be',
        },
        courseTabLabel: {
          class: 'Service Type/Options ',
        },
        tourStep: {
          name: 'This will be the name of your service that appears on the navigation bar and during the enrollment steps.',
          path: "This will be the link to access your service page. This part will be the link after 'yourdomain/@/'. Make sure it's easy to remember.",
          previewImage:
            "Upload a 21:9 banner to showcase your service. If you don't have any banner designs, we can help you.",
          classColumn:
            'Here is the list of service types you have created. A service type corresponds to a specific schedule.',
          className:
            'The service type name should be a short description of the schedule of your session. For example, "9:00AM Yoga Class", or a "Biweekly course". The customers see this to choose which schedule they want to enroll in.',
          classTuition:
            'Set the price per session for this service type. Our system will automatically multiply this by the number of sessions customers apply for to determine the total fee. If you only have the price of the entire package of service type, simply divide the total price by the number of sessions.',
          classQuota:
            'This will be the maximum number of customers that can enroll in this service type. Afterwards, customers must contact you first if they are interested.',
          classSchedule:
            'Here you can define exactly the time of your sessions. We also made it easy for you to add multiple sessions that are within a single period. One period should correspond to an entire series of sessions within the service. We recommend you to name your phases according to the time of the period. For example, "August Package" or "Winter Session".',
          classCalendar:
            'You can view the calendar of all the sessions of your service type here.',
        },
        tag: {
          createCourseTag: 'Service tags',
          description:
            'A tag is a custom label that you assign to the service. You can create tags to identify the service.',
        },
        task: {
          title: 'How to create a complete Service?',
          courseName: 'Give your service a name',
          coursePreviewImage: 'Upload your service preview image',
          coursePath: 'Provide a path for your service',
          courseDescription: 'Describe your service in around 200 words',
          courseRegistrationMessage: 'Provide a brief registration message',
          coursePublish: 'Publish your service',
          regularDetail: 'Create a class',
        },
        basic: {
          name: 'Service name',
        },
        courseDescription: {
          regular:
            'Each service type will have a fixed number of sessions that users can apply to. All sessions will end their application period at the same time',
          workshop:
            'One-time events with one or more timeslots. Will not repeat. Suitable for promotional events and trials',
          recurring:
            'Never-ending schedule that repeats on the same day every week. Allows customers to join at any week',
          subscription:
            'Simple setup. No timeslot settings required. Customers will be charged periodically. Fit for membership or subscription-based services',
        },
        subscriptionSetting: {
          productName: 'Service name',
        },
        additionalFee: {
          editReminder:
            'Editing an existing fee will affect all other services added',
        },
        message: {
          registrationMessage:
            'This message will be displayed on the page when a customer register for your service.',
        },
        prerequisites: {
          courseIsRequired: 'Service is required',
          classIsRequired: 'Service type is required',
        },
      },
      student: {
        studentTable: 'Customer Central',
        createStudent: 'Create Customer',
        importCsv: {
          title: 'Import Data',
          fields: {
            StudentName: 'Customer Name',
            StudentEmail: 'Customer Email',
            StudentPhone: 'Customer Phone',
            CourseName: 'Service Name',
            ClassName: 'Service Type Name',
          },
          tutorialSelectField: {
            line1:
              "These three fields are compulsory for mapping customer's personal information.",
            line2:
              'Please specify the relationship and correspondence of columns in the csv file and customer information fields in your Flowclass customer database.',
            line3:
              'If the email and phone of a customer already exist in the database, no new customer record will be created. However, you can still assign custom data fields to the user in the next step.',
            line4:
              'If the phone number of a customer already exist in the database but the email is different, a new customer record will be created.',
          },
        },
        teachingService: {
          addStudentWithOptionalCourse: 'Create Customer Profile',
          enterFee: 'Service Fee',
          chooseCourse: 'Choose service',
          chooseClass: 'Choose service type',
          firstLessonDateTime: 'Session date time',
        },
      },
      promotion: {
        teachingServiceOption1: 'The coupon is applicable to all services',
        teachingServiceOption2:
          'The coupon is ONLY applicable to the selected services',
        teachingService: 'Service',
      },
      whatsappTemplate: {
        notYetReady:
          'We will be releasing a feature to let you automate sending out reminder WhatsApp messages to your customers. You can create your message templates first.',
      },
      embed: {
        configuration: {
          setWidthHeightCourse:
            'Please select the service you want to link to, and then set the width and height of the widget:',
        },
      },
      subscription: {
        limit: {
          maxOfActiveStudents: 'Max No. of Active Customers',
        },
        unused: {
          maxOfTotalStudents: 'Max No. of Total Customers',
          maxOfTotalClasses: 'Max No. of Service Types',
        },
      },
      lessonDateTime: {
        selectCourse: 'Select service',
        selectClass: 'Select service type',
      },
    },
    zh: {
      component: {
        menubar: {
          headings: {
            courses: '服務與申請',
          },
          teachingService: '服務',
          studentRecord: '用戶中心',
          classSchedule: '服務時間表',
          blockTime: '閉店時間',
        },
        SectionTag: {
          SCHOOL_FACILITIES: '關於我們',
          SCHOOL_QUALIFICATION_AWARDS: '我們的服務',
          SCHOOL_SUPPORT: '公司支援',
          COURSE_FEATURES: '服務特色',
          COURSE_SYLLABUS: '服務功能',
          COURSE_ENQUIRY: '服務查詢',
        },
      },
      onboarding: {
        taskTitle: {
          centre: '個人化你的商業頁面',
        },
        schoolSettings: {
          domain: '選擇一個連結，客戶將使用它來前往您的頁面',
          name: '選擇一個名稱，以吸引更多客戶',
          logo: '上傳您的商業Logo',
          banner: '上傳您的商業Banner',
          contact: '填入商業聯絡資訊',
          description: '寫一個至少200個字元的商業頁面描述，以吸引更多客戶',
          location: '填入商業地址',
        },
        courseSettings: {
          description: '寫一個至少200個字元的活動描述，以吸引更多客戶',
        },
      },
      pricingPlan: {
        quotas: {
          currentActiveStudents: '當前活躍客戶數量',
        },
      },
      school: {
        tourStep: {
          welcomeContent:
            '只需幾個簡單步驟，您就能充分發揮 Flowclass 的潛力。按照以下步驟來建立您的商業主頁。',
          floatingContent: '此選單將提供完成公司資料所需步驟的說明',
          name: '這將是您的品牌名稱，會顯示在每個網頁的導航欄上。',
          banner:
            '上傳一張 21:9 的橫幅圖片來展示您的品牌。如果您沒有合適的圖片，我們可以幫您製作。',
          descriptionTab:
            '商業描述是您 Flowclass 網站的重要組成部分。它將顯示在您的品牌主頁上，是潛在客戶前往您網站時看到的第一個內容',
          textEditor:
            '您可以通過添加圖片或視頻為客戶提供更多信息。我們提供了一個文本編輯器，讓您能夠美化文字樣式。',
          contactTab: '聯絡方式是客戶與您溝通的橋樑',
          galleryColumn:
            '通過圖片展示您的業務。我們建議了幾個圖片類別，讓您上傳照片以打動客戶。',
          congratulationsContent:
            '您已完成創建主頁的導覽。現在，您可以快速創建第一個服務並開始您的品牌之旅',
          contact:
            '客戶需要您的主要聯絡電話和電子郵件來查詢您的服務。這些信息將顯示在「服務查詢」部分以及每個頁面的頁腳中。',
          contact2:
            '我們設置了讓客戶可以直接通過 WhatsApp 聯繫您的電話號碼。如果您不太習慣，也可以只提供電子郵件地址。',
          address:
            '如果您有實體地點，請在此填寫地址，讓客戶知道他們將在哪裡參與。',
        },
        basic: {
          schoolBranding: '品牌形象',
          schoolName: '公司名稱',
          schoolNameDescription:
            '此名稱將顯示在網站標題、搜尋結果中以及發送給客戶的所有電子郵件中。應為貴公司的正式名稱',
          website: '輸入您的公司別名',
          previewWebsite: '您的公司網站連結將是',
        },
        task: {
          title: '要建立一個吸引人的公司檔案，請完成以下任務：',
          schoolName: '為您的公司命名',
          schoolLogo: '上傳公司標誌',
          schoolBanner: '上傳公司橫幅',
          schoolDescription: '使用預設部分描述您的公司',
          schoolPhone: '提供公司電話號碼',
          schoolEmail: '提供公司電子郵件',
          schoolAddress: '提供公司地址',
          schoolGallery: '在相簿中上傳至少3張您的服務照片',
        },
        hints: {
          school: {
            SCHOOL_FACILITIES: '清楚闡述公司的目的、使命和願景。',
            SCHOOL_QUALIFICATION_AWARDS: '展示您的服務和公司獨特的優勢。',
            SCHOOL_SUPPORT:
              '提供有關您的客戶支援服務資訊，包括聯絡方式、營業時間、售後服務、技術支援，以及其他為客戶提供的協助。',
            SCHOOL_FAQS:
              '包含關於您的服務或業務運營的常見問題。建議涵蓋客戶經常詢問的定價、配送、保固或使用相關問題。',
          },
          course: {
            COURSE_FEATURES:
              '清楚闡述服務的主要目標和目的。學員完成後能達到什麼成就或學到什麼？',
            COURSE_SYLLABUS: '提供服務的詳細大綱，讓客戶清楚了解服務內容。',
          },
        },
        gallery: {
          imageTag: {
            environment: '環境',
            student: '服務',
            courseReview: '服務評價',
            teacherQualification: '推廣',
          },
        },
        contact: {
          details: '客戶將通過以下信息與您聯繫以進行查詢。',
          addressTips:
            '您的地址將公開在網站上。如果您是線上服務，可以跳過此部分。',
        },
      },
      setting: {
        customizeSite: {
          description:
            '這將是客戶將使用的連結，如果您更改它，客戶將無法使用舊連結前往您的網站。',
        },
        studentInformation: {
          notification:
            '自定義數據字段用於存儲客戶的信息。這些字段可用於為客戶創建申請表單，以便他們在申請服務時填寫。',
        },
        applicationForm: {
          descriptionCreate: '僅供您查看，不會顯示給客戶。',
        },
        additionalFee: {
          additionalFeeDisplay:
            '額外費用名稱將顯示給客戶，以便他們了解他們需要支付的費用。',
          compulsory: '新客戶註冊費用',
        },
        userManagement: {
          selectSchool: '選擇事業',
          inviteOthers:
            '您可以邀請其他同事或客戶加入您的網站，他們可以幫助您管理付款和服務。',
          inviteNewUserSchool: '邀請用戶到事業',
          noUsers: '您目前沒有任何用戶在這個事業。',
        },
      },
      teachingService: {
        allCourses: '所有服務',
        createCourse: '創建服務',
        unnamedCourse: '未命名服務',
        alert: '您必須發佈服務才能查看服務頁面。',
        noCourse: '您目前沒有服務，請創建您的第一個服務以開始接收申請。',
        noSchool: '您目前沒有商業頁面或遇到錯誤。請創建新的商業頁面以繼續。',
        class: {
          name: '服務名稱',
          selectClass: '選擇服務類型',
          tuition: '價格',
          quota: 'Quota',
          noClassYet:
            '您目前沒有服務類型，創建服務類型允許您創建不同版本的服務。',
          createClass: '創建服務類型',
          numOfLessons: '活動數量',
          priceForClass: '設定為服務總價',
          schedule: '活動時間表',
          minimumPurchaseLesson:
            '每個客戶必須在每個時段購買至少一個服務。如果一個時段有4個服務，客戶必須購買至少4個服務。',
          durationPerLesson: '每個服務的時間長度',
          addLesson: '添加單個服務',
          addMultipleLessons: '添加多個服務',
          dropInTitle: '允許在服務中間加入 (Drop In)',
          dropInDescription:
            '允許客戶在服務中間加入。系統將自動調整並計算服務費用，根據剩餘的服務數量',
          multipleClassesTitle: '多個服務',
          multipleClassesDescription: '允許客戶與其他服務一起報名這個服務。',
        },
        feeNTime: {
          freeLesson: '免費',
          sendEmailQuestion: '發送電子郵件給客戶？',
        },
        course: {
          selectCourse: '選擇服務',
          selectClass: '選擇服務類型',
        },
        createCourseModal: {
          title: '創建新服務頁面',
          textInput: '您將創建一個新服務的頁面',
          successCreate: '服務已成功創建。您可以開始編輯它。',
          name: '服務名稱',
        },
        view: {
          viewSite: '查看服務頁面',
          courseLink: '服務頁面的連結將是',
          applicationLink: '服務類型的頁面連結將是',
        },
        courseTabLabel: {
          class: 'Service Type/Options ',
        },
        tourStep: {
          name: '這將是您的服務名稱，將出現在導航欄和申請步驟中。',
          path: "這將是您服務頁面的連結。這部分將是 'yourdomain/@/' 之後的連結。確保它容易記憶。",
          previewImage:
            '上傳一張 21:9 的橫幅圖片來展示您的服務。如果您沒有合適的圖片，我們可以幫您製作。',
          classColumn:
            '這裡是您創建的服務類型列表。一個服務類型對應一個特定的時段。',
          className:
            '服務類型名稱應該是您課程時段的簡短描述。例如，"9:00AM Yoga Class"，或a "Biweekly course". The customers see this to choose which schedule they want to enroll in.',
          classTuition:
            'Set the price per session for this service type. Our system will automatically multiply this by the number of sessions customers apply for to determine the total fee. If you only have the price of the entire package of service type, simply divide the total price by the number of sessions.',
          classQuota:
            'This will be the maximum number of customers that can enroll in this service type. Afterwards, customers must contact you first if they are interested.',
          classSchedule:
            'Here you can define exactly the time of your sessions. We also made it easy for you to add multiple sessions that are within a single period. One period should correspond to an entire series of sessions within the service. We recommend you to name your phases according to the time of the period. For example, "August Package" or "Winter Session".',
          classCalendar:
            'You can view the calendar of all the sessions of your service type here.',
        },
        tag: {
          createCourseTag: '服務標籤',
          description:
            '標籤是您分配給服務的自訂標籤。您可以創建標籤以識別服務。',
        },
        task: {
          title: '如何創建完整的服務？',
          courseName: '為您的服務命名',
          coursePreviewImage: '上傳您的服務預覽圖片',
          coursePath: '提供服務的路徑',
          courseDescription: '在200個字元內描述您的服務',
          coursePublish: '發佈您的服務',
          regularDetail: '創建一個課程',
        },
        basic: {
          name: '服務名稱',
        },
        courseDescription: {
          regular:
            '每個服務類型將有固定數量的課程，用戶可以申請。所有服務將在同一時間結束申請期',
          workshop:
            '一次性的活動，具有一個或多個時段。不會重複。適合用於促銷活動和試用',
          recurring: '永遠重複的時間表，每週在同一天重複。允許客戶在任何週加入',
          subscription:
            '簡單的設定。不需要時段設定。客戶將定期收費。適合會籍或訂閱式服務',
        },
        subscriptionSetting: {
          productName: '服務名稱',
        },
        additionalFee: {
          editReminder: '編輯現有費用將影響所有其他添加的服務',
        },
        message: {
          registrationMessage: '這則訊息將在客戶註冊您的服務時顯示在頁面上。',
        },
        prerequisites: {
          courseIsRequired: '服務是必填的',
          classIsRequired: '服務類型是必填的',
        },
      },
      student: {
        studentTable: '客戶中心',
        createStudent: '創建客戶',
        importCsv: {
          title: '匯入客戶資料',
          fields: {
            StudentName: '客戶名稱',
            StudentEmail: '客戶電子郵件',
            StudentPhone: '客戶電話號碼',
            CourseName: '服務名稱',
            ClassName: '服務類型名稱',
          },
          tutorialSelectField: {
            line1: '這三個欄位是必須的，用於映射客戶的個人信息。',
            line2: '請指定csv文件和客戶信息欄位之間的關係和對應。',
            line3:
              '如果客戶的電子郵件和電話號碼已經存在於資料庫中，則不會創建新的客戶記錄。然而，您仍然可以在下一步中分配自定義數據欄位。',
            line4:
              '如果客戶的電話號碼已經存在於資料庫中但電子郵件不同，則會創建新的客戶記錄。',
          },
        },
        teachingService: {
          addStudentWithOptionalCourse: '創建客戶檔案',
          enterFee: '服務費用',
          chooseCourse: '選擇服務',
          chooseClass: '選擇服務類型',
          firstLessonDateTime: '日期時間',
        },
      },
      promotion: {
        teachingServiceOption1: '此優惠券適用於所有服務',
        teachingServiceOption2: '此優惠券僅適用於選定的服務',
        teachingService: '服務',
      },
      whatsappTemplate: {
        notYetReady:
          '我們將發布一個功能，讓您自動發送提醒 WhatsApp 消息給您的客戶。您可以先創建您的消息模板。',
      },
      embed: {
        configuration: {
          setWidthHeightCourse:
            '請選擇您要連結的服務，然後設定小部件的寬度和高度：',
        },
      },
      subscription: {
        limit: {
          maxOfActiveStudents: '最大活躍客戶數',
        },
        unused: {
          maxOfTotalStudents: '最大客戶數',
          maxOfTotalClasses: '最大服務類型數',
        },
      },
      lessonDateTime: {
        selectCourse: '選擇服務',
        selectClass: '選擇服務類型',
      },
    },
  },
}

export default versionedResources
