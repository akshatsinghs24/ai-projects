// campus-ai.js - Offline Knowledge & Rule-Based University Assistant Engine
// Provides high-quality responses even without an API key!

const CampusAI = {
  getOfflineResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    // 1. Email Templates
    if (msg.includes("email") || msg.includes("professor") || msg.includes("prof") || msg.includes("leave") || msg.includes("sick")) {
      if (msg.includes("extension") || msg.includes("deadline") || msg.includes("late")) {
        return `### ✉️ Formal Email Template: Requesting a Deadline Extension

**Subject:** [Course Code] - Request for Extension - [Your Full Name] - [Student ID]

Dear Professor [Professor's Last Name],

I hope this email finds you well.

I am writing to respectfully request a brief extension for the upcoming **[Assignment Name]**, currently due on **[Original Due Date]**. 

Unfortunately, [state brief reason, e.g., *I have come down with a sudden illness / I have encountered unforeseen personal difficulties*], which has impeded my ability to complete the work to the high academic standard I strive for.

Would it be possible to submit my assignment by **[Proposed New Date and Time]**? I have already completed [mention progress, e.g., *the research outline and draft bibliography*] and would be glad to share my current progress if needed.

Thank you very much for your time, understanding, and consideration.

Sincerely,  
**[Your Full Name]**  
Student ID: [Your Student ID]  
[Course Name & Section Number]`;
      }

      if (msg.includes("recommendation") || msg.includes("lor") || msg.includes("reference")) {
        return `### ✉️ Formal Email Template: Letter of Recommendation Request

**Subject:** Letter of Recommendation Request - [Your Full Name]

Dear Professor [Professor's Last Name],

I hope you are having a wonderful semester.

I truly enjoyed taking your course **[Course Name & Code]** during the [Semester/Year, e.g., *Fall 2025*], particularly our discussions on [mention specific topic or project you excelled at].

I am currently preparing my applications for [Graduate School / Internship / Scholarship Name], and I am writing to ask if you would feel comfortable writing a strong letter of recommendation on my behalf. The deadline for submission is **[Date]**.

I have attached my updated resume, transcript, and personal statement draft for your reference. I would also be delighted to meet briefly during your office hours if you have any questions.

Thank you very much for your time and mentorship.

Warm regards,  
**[Your Full Name]**  
Student ID: [Your ID]  
[Contact Information]`;
      }

      return `### ✉️ General Office Hours & Question Email Template

**Subject:** [Course Code] - Question regarding [Topic/Assignment] - [Your Full Name]

Dear Professor [Professor's Last Name],

I hope your week is going smoothly.

I am a student in your **[Course Code & Section]** class. While reviewing the lecture material on **[Specific Topic]**, I had a question regarding [briefly state question].

Could I please schedule a 10-minute meeting during your office hours on [Day/Time], or would another time suit you better?

Thank you for your guidance.

Best regards,  
**[Your Full Name]**  
Student ID: [Your ID]`;
    }

    // 2. GPA & Grading
    if (msg.includes("gpa") || msg.includes("cgpa") || msg.includes("grade") || msg.includes("grading")) {
      return `### 🧮 University GPA Calculation Guide

Your **Grade Point Average (GPA)** is calculated using weighted quality points based on course credits:

$$\\text{GPA} = \\frac{\\sum (\\text{Grade Point} \\times \\text{Credit Hours})}{\\sum \\text{Total Credit Hours}}$$

#### Standard 4.0 Scale Conversion Table:
| Letter Grade | Percentage | Grade Point (4.0 Scale) |
|---|---|---|
| **A+ / A** | 93 - 100% | 4.0 |
| **A-** | 90 - 92% | 3.7 |
| **B+** | 87 - 89% | 3.3 |
| **B** | 83 - 86% | 3.0 |
| **B-** | 80 - 82% | 2.7 |
| **C+** | 77 - 79% | 2.3 |
| **C** | 73 - 76% | 2.0 |
| **D** | 60 - 69% | 1.0 |
| **F** | < 60% | 0.0 |

> **Quick Example:**  
> - CS 101 (3 credits): Grade A (4.0) $\\rightarrow 3 \\times 4.0 = 12.0$  
> - Calculus I (4 credits): Grade B+ (3.3) $\\rightarrow 4 \\times 3.3 = 13.2$  
> - Physics (3 credits): Grade B (3.0) $\\rightarrow 3 \\times 3.0 = 9.0$  
> **Total Points:** $34.2 \\div 10 \\text{ credits} = \\mathbf{3.42 \\text{ GPA}}$`;
    }

    // 3. Citations
    if (msg.includes("citation") || msg.includes("cite") || msg.includes("apa") || msg.includes("mla") || msg.includes("chicago") || msg.includes("ieee")) {
      return `### 📖 Academic Citation Quick Reference Guide

Here are standard formats for citing a book or journal article:

#### 1. APA 7th Edition (Social Sciences, Education, Psychology)
* **Book:** Author, A. A. (Year). *Title of work: Capital letter also for subtitle*. Publisher.
  * *Example:* Smith, J. D. (2023). *Introduction to Cognitive Psychology*. Oxford University Press.
* **Journal:** Author, A. A., & Author, B. B. (Year). Title of article. *Title of Periodical*, *Volume*(Issue), pages. https://doi.org/xx

#### 2. MLA 9th Edition (Humanities & Literature)
* **Book:** Author Last, First. *Title of Book*. Publisher, Year.
  * *Example:* Morrison, Toni. *Beloved*. Alfred A. Knopf, 1987.
* **In-Text Citation:** (Author Last Name Page#), e.g., (Smith 42).

#### 3. IEEE (Engineering & Computer Science)
* **Reference List:** [1] A. B. Author, *Title of Book*, xth ed. City, Country: Publisher, Year, pp. xxx–xxx.
* **In-Text:** Mention in square brackets, e.g., "...as demonstrated in [1]."`;
    }

    // 4. Study Methods / Exam Prep
    if (msg.includes("study") || msg.includes("exam") || msg.includes("pomodoro") || msg.includes("feynman") || msg.includes("plan") || msg.includes("schedule")) {
      return `### 🎯 High-Yield Study Techniques for College Students

1. **The Feynman Technique (Understand Any Complex Concept)**
   - **Step 1:** Choose the concept you want to learn.
   - **Step 2:** Pretend you are teaching it to a 12-year-old child (use zero jargon, simple analogies).
   - **Step 3:** Identify where you get stuck or use overly complicated terms.
   - **Step 4:** Return to your lecture slides or textbook to simplify that gap.

2. **Active Recall & Spaced Repetition (The Gold Standard)**
   - Don't just re-read or highlight notes (this gives an illusion of competence).
   - Close your notes and write down everything you remember on a blank piece of paper (**Blurting Method**).
   - Use flashcard tools like Anki with intervals of 1, 3, 7, and 14 days.

3. **50/10 Pomodoro Study Sprint**
   - 50 minutes of deep, notification-free focus.
   - 10 minutes of physical movement, water, and rest away from screens.
   - After 3 cycles, take a long 30-minute break.

> 💡 **Tip:** Add a free Google Gemini API key in the top-right Settings menu to generate personalized flashcards and custom study plans for your exact syllabus!`;
    }

    // 5. Assignment / Essay Outline
    if (msg.includes("essay") || msg.includes("paper") || msg.includes("outline") || msg.includes("thesis")) {
      return `### 📝 Standard Academic Essay & Term Paper Outline

1. **Introduction (10% of word count)**
   - **Hook:** Start with a compelling statistic, quotation, or paradox.
   - **Background Context:** Define key terms and historical/theoretical context.
   - **Thesis Statement:** A clear, arguable 1–2 sentence claim answering the research question.

2. **Body Paragraphs (80% of word count) - Use the P.E.E.L Structure:**
   - **P (Point):** Clear topic sentence introducing the paragraph's core claim.
   - **E (Evidence):** Direct citations, empirical data, or peer-reviewed findings.
   - **E (Explanation):** Analyze *why* this evidence proves your point.
   - **L (Link):** Connect back to your central thesis and segue to the next point.

3. **Counter-Argument & Rebuttal:**
   - Acknowledge opposing viewpoints to demonstrate critical thinking.

4. **Conclusion (10% of word count)**
   - Restate thesis in fresh words.
   - Synthesize main findings (do not introduce new evidence).
   - Broader implications / call for future research.`;
    }

    // 6. Greetings & General Help
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg === "help" || msg.includes("who are you")) {
      return `### 👋 Hello! I'm your University AI Assistant (UniBot).

I'm designed to help college and university students succeed academically and balance campus life.

**Here's what I can help you with right away:**
- ✉️ **Professor Emails:** Extension requests, office hours, recommendation letters.
- 🧮 **GPA & Grades:** Calculate semester GPA and explain grading scales.
- 📖 **Citations:** Quick formatting for APA 7th, MLA 9th, and IEEE.
- 🎯 **Study Techniques:** Feynman technique, exam prep schedules, and essay outlines.
- 🎓 **Course Concepts:** Ask me to explain any topic simply!

*(Optional: Click **⚙️ Settings** at top to add your free Gemini API key for real-time generative answers on any lecture question!)*`;
    }

    // Fallback response
    return `### 🎓 Campus Academic Assistant

I received your prompt: **"${userMessage}"**

Here are some helpful academic tips related to university coursework:
- **Break it down:** Try breaking complex projects into 3 manageable subtasks today.
- **Office hours:** Your professors and teaching assistants are your best resource—don't hesitate to email them early!
- **Active Recall:** Testing yourself beats re-reading notes every time.

> 💡 **Unlock Full AI Powers:**  
> Connect a free Google Gemini API key by clicking the **⚙️ Settings** icon in the header. Once connected, UniBot can solve specific homework problems, explain code, analyze scientific papers, and write custom essays!`;
  }
};

// Export for node or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = CampusAI;
}
