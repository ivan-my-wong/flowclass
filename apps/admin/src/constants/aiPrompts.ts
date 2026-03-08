const courseDescriptionBasic = [
  {
    value: 'courseTitle',
    label: 'aiTool:courseDescriptionBasic.courseTitle',
    placeholder: 'aiTool:courseDescriptionBasic.courseTitlePlaceholder',
  },
  {
    value: 'courseDescription',
    label: 'aiTool:courseDescriptionBasic.courseDescription',
    placeholder: 'aiTool:courseDescriptionBasic.courseDescriptionPlaceholder',
  },
  {
    value: 'suitableFor',
    label: 'aiTool:courseDescriptionBasic.suitableFor',
    placeholder: 'aiTool:courseDescriptionBasic.suitableForPlaceholder',
  },
  {
    value: 'courseInstructor',
    label: 'aiTool:courseDescriptionBasic.courseInstructor',
    placeholder: 'aiTool:courseDescriptionBasic.courseInstructorPlaceholder',
  },
  {
    value: 'courseSchedule',
    label: 'aiTool:courseDescriptionBasic.courseSchedule',
    placeholder: 'aiTool:courseDescriptionBasic.courseSchedulePlaceholder',
  },
]
const courseDescriptionAdvance = [
  {
    value: 'courseTitle',
    label: 'aiTool:courseDescriptionAdvance.courseTitle',
    placeholder: 'aiTool:courseDescriptionAdvance.courseTitlePlaceholder',
  },
  {
    value: 'courseDescription',
    label: 'aiTool:courseDescriptionAdvance.courseDescription',
    placeholder: 'aiTool:courseDescriptionAdvance.courseDescriptionPlaceholder',
  },
  {
    value: 'suitableFor',
    label: 'aiTool:courseDescriptionAdvance.suitableFor',
    placeholder: 'aiTool:courseDescriptionAdvance.suitableForPlaceholder',
  },
  {
    value: 'courseInstructor',
    label: 'aiTool:courseDescriptionAdvance.courseInstructor',
    placeholder: 'aiTool:courseDescriptionAdvance.courseInstructorPlaceholder',
  },
  {
    value: 'courseCurriculum',
    label: 'aiTool:courseDescriptionAdvance.courseCurriculum',
    placeholder: 'aiTool:courseDescriptionAdvance.courseCurriculumPlaceholder',
  },
  {
    value: 'learningObjective',
    label: 'aiTool:courseDescriptionAdvance.learningObjective',
    placeholder: 'aiTool:courseDescriptionAdvance.learningObjectivePlaceholder',
  },
  {
    value: 'courseLength',
    label: 'aiTool:courseDescriptionAdvance.courseLength',
    placeholder: 'aiTool:courseDescriptionAdvance.courseLengthPlaceholder',
  },
  {
    value: 'courseSchedule',
    label: 'aiTool:courseDescriptionAdvance.courseSchedule',
    placeholder: 'aiTool:courseDescriptionAdvance.courseSchedulePlaceholder',
  },
  {
    value: 'courseMaterials',
    label: 'aiTool:courseDescriptionBasic.courseMaterials',
    placeholder: 'aiTool:courseDescriptionBasic.courseMaterialsPlaceholder',
  },
  {
    value: 'prerequisites',
    label: 'aiTool:courseDescriptionBasic.prerequisites',
    placeholder: 'aiTool:courseDescriptionBasic.prerequisitesPlaceholder',
  },
  {
    value: 'enquiry',
    label: 'aiTool:courseDescriptionAdvance.enquiry',
    placeholder: 'aiTool:courseDescriptionAdvance.enquiryPlaceholder',
  },
]

const courseCurriculum = [
  {
    value: 'courseTitle',
    label: 'aiTool:courseDescriptionBasic.courseTitle',
    placeholder: 'aiTool:courseDescriptionBasic.courseTitlePlaceholder',
  },
  {
    value: 'courseDescription',
    label: 'aiTool:courseDescriptionBasic.courseDescription',
    placeholder: 'aiTool:courseDescriptionBasic.courseDescriptionPlaceholder',
  },
  {
    value: 'suitableFor',
    label: 'aiTool:courseDescriptionBasic.suitableFor',
    placeholder: 'aiTool:courseDescriptionBasic.suitableForPlaceholder',
  },
  {
    value: 'courseInstructor',
    label: 'aiTool:courseDescriptionBasic.courseInstructor',
    placeholder: 'aiTool:courseDescriptionBasic.courseInstructorPlaceholder',
  },
  {
    value: 'courseSchedule',
    label: 'aiTool:courseDescriptionBasic.courseSchedule',
    placeholder: 'aiTool:courseDescriptionBasic.courseSchedulePlaceholder',
  },
]
export const prompts = {
  role: {
    courseOutline: `
      You are an experienced course designer and teacher tasked with creating a comprehensive curriculum and outline for a new online course. 
      Your goal is to develop a well-structured, engaging, and effective learning experience for students.
      `,
    courseDescription: `
      You are an experienced marketer promoting a course. 
      Your goal is to create compelling marketing materials and campaigns to attract potential students and increase enrollment for the course. 
    `,
    improveWriting: `
      You are an experienced professional media editor tasked with improving the format, wording, and organization of text content.
    `,
  },
  instruction: {
    courseDescription: `
      You should highlight the key benefits, unique selling points, 
      and value proposition of the course in a persuasive and engaging manner.
      `,
    courseOutline: `
      You should consider the course objectives, target audience, prerequisite knowledge, and desired learning outcomes. 
      Additionally, you should plan the course structure, module breakdowns, lesson plans, assessments, 
      and instructional strategies to facilitate meaningful learning.
    `,
    improveWriting: `
      Your goal is to enhance the readability, structure, and visual appeal of the content by utilizing appropriate formatting techniques, 
      such as lists, tables, headings, and other stylistic elements. 
      You should also refine the language, ensuring clarity, conciseness, 
      and adherence to proper grammar and style conventions. 
      Additionally, you should aim to organize the content in a logical and coherent manner, 
      making it easier for the reader to navigate and comprehend the information.
   `,
  },
  goal: {
    targetAudience: 'The target audience for the course is',
    courseName: 'The name of the course is',
    courseValueProposition: 'The value proposition of the course is',
    courseDescription: 'The course description should include the following:',
    instructorName: 'The name of the instructor is',
    instructorQualifications: 'The qualifications of the instructor are',
    courseOutline:
      'The course outline should include the following modules or topics:',
    learningObjectives: 'The learning objectives of the course are',
    pricing: 'The pricing for the course is',
    callToAction: 'The call-to-action for the landing page is',
  },

  style: {
    fontStyles: `For the instructions above, be as detailed as possible, and following the following HTML guidelines.
    The text is to be inserted into an HTML document inside the <body> tag (without the <html> and <body> tags).\n
    1. Set the title of the entire content as <h1> and set subtitles as <h2> and <h3> respectively.\n
    2. Each sentence within an HTML tag MUST BE a complete sentence. Only use <br />, </h2>, </h2> and </h3> after a complete sentence.\n
    3. Use <b></b> and <i></i> to bold and italicize text that needs to be highlighted.\n
    4. All HTML tags returned must stick together.\n
    5. Paragraphs should be of the same font size.\n
    6. Do not give any additional explanations. Code only. DO NOT CONTAIN the stop sequence or separator sequence`,
    followPrevious:
      '[VERY IMPORTANT] You have already written some of the content. Check the previous message. Please continue what you have written in the previous message. Do not repeat.',
    start:
      'Ignore all the instructions you got before. From now on, you are going to help me to draft a paragraph to describe my teaching class.\n',
    describeImage:
      'A poster of the course to be described is provided. Following are recognized text in the image:',
  },
}

export const aiScenarios: Record<string, ScenarioProps> = {
  courseDescriptionBasic: {
    label: 'aiTool:scenarios.basicCourseDescription',
    value: courseDescriptionBasic,
    type: 'guidance',
  },
  advanceCourseDescription: {
    label: 'aiTool:scenarios.advanceCourseDescription',
    value: courseDescriptionAdvance,
    type: 'guidance',
  },
  courseCurriculumTemplate: {
    label: 'aiTool:scenarios.courseCurriculumTemplate',
    value: courseCurriculum,
    type: 'guidance',
  },
  improveWriting: {
    label: 'aiTool:scenarios.improveWriting',
    placeholder: 'aiTool:scenarioPlaceholders.improveWriting',
    value: '',
    type: 'freeform',
  },
  continueWriting: {
    label: 'aiTool:scenarios.continueWriting',
    placeholder: 'aiTool:scenarioPlaceholders.continueWriting',
    value: '',
    type: 'freeform',
  },

  writeYourPrompt: {
    label: 'aiTool:scenarios.writeYourPrompt',
    value: '',
    placeholder: 'aiTool:scenarioPlaceholders.prompt',
    type: 'freeform',
  },
}

export type ScenarioProps = {
  value: Record<string, string>[] | string
  label: string
  instruction?: string
  placeholder?: string
  type: 'guidance' | 'freeform'
}

export const promptGoalTypes = {
  targetAudience: 'targetAudience',
  courseName: 'courseName',
  courseValueProposition: 'courseValueProposition',
  courseDescription: 'courseDescription',
  instructorName: 'instructorName',
  instructorQualifications: 'instructorQualifications',
  courseOutline: 'courseOutline',
  learningObjectives: 'learningObjectives',
  pricing: 'pricing',
  callToAction: 'callToAction',
}

export const scenarioOptions = Object.keys(aiScenarios).map(
  scenario => (aiScenarios as any)[scenario]
)

export const example = `
"Please generate HTML code for a course landing page that follows a typical structure and includes the following content elements:
Header section: a logo and a navigation menu with links to other pages on the website, such as the home page and about page.
Hero section: an eye-catching hero image or video, a heading that introduces the course and its value proposition, and a call-to-action button that directs the user to the registration form.
Course description section: a heading that clearly states the course name and a subheading that summarizes the course, a paragraph of text that describes the course in detail, and a bulleted list of learning objectives that students can expect to achieve after taking the course.
Instructor section: a heading that introduces the instructor and a paragraph of text that describes the instructor's experience and qualifications, as well as a photograph of the instructor.
Course outline section: a heading that lists the modules or topics covered in the course, followed by a brief description of each module and the estimated time required to complete it.
Student testimonials section: a heading that displays positive feedback from previous students, with photos and names to add credibility.
Frequently asked questions section: a heading that lists the most commonly asked questions about the course, with concise and informative answers.
Call-to-action section: a final call-to-action button that directs the user to the registration form, or any other action the user needs to take, such as a free trial or a demo.
Please ensure that the HTML code is well-structured, uses semantic HTML tags such as <header>, <section>, and <article>, and is responsive and accessible for all devices and users. Thank you!"
`
