# graph.py - LangGraph Workflow for University Student Assistant (UniBot)
import os
import re
from typing import Annotated, Literal
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# Try importing LLM integrations (supports Gemini, OpenAI, Groq)
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

try:
    from langchain_openai import ChatOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


# 1. State Definition
class StudentState(TypedDict):
    messages: Annotated[list, add_messages]
    intent: str
    persona: str


# 2. Helper to get active LLM
def get_llm():
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if gemini_key and HAS_GEMINI:
        return ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            google_api_key=gemini_key,
            temperature=0.7,
        )
    elif openai_key and HAS_OPENAI:
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            api_key=openai_key,
            temperature=0.7,
        )
    return None


# 3. Router / Classifier Node
def route_intent(state: StudentState) -> dict:
    """Classifies the student query into a specialized university category."""
    last_msg = ""
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage) or getattr(msg, "type", "") == "human":
            last_msg = msg.content.lower()
            break

    # Keyword and heuristic routing (fast, zero token overhead for routing)
    if any(k in last_msg for k in ["email", "professor", "prof", "extension", "deadline", "recommendation", "lor", "sick leave"]):
        intent = "email"
    elif any(k in last_msg for k in ["gpa", "cgpa", "grade", "grading", "credit hour", "quality points"]):
        intent = "gpa"
    elif any(k in last_msg for k in ["cite", "citation", "apa", "mla", "chicago", "ieee", "bibliography", "references"]):
        intent = "citation"
    elif any(k in last_msg for k in ["study", "feynman", "exam", "quiz", "pomodoro", "recall", "explain", "concept"]):
        intent = "study"
    else:
        intent = "general"

    return {"intent": intent}


# 4. Specialized Specialist Nodes

def email_node(state: StudentState) -> dict:
    """Specialist node for drafting polite, academic emails to professors."""
    llm = get_llm()
    user_prompt = state["messages"][-1].content

    if llm:
        sys = SystemMessage(content=(
            "You are UniBot's Academic Email Specialist. Draft professional, polite, and well-structured "
            "emails for college students communicating with professors, TAs, or academic advisors. "
            "Always include placeholders like [Professor Name], [Course Code], [Student ID]. "
            "Tone: Courteous, concise, respectful of academic etiquette."
        ))
        response = llm.invoke([sys] + state["messages"])
        return {"messages": [response]}

    # Offline campus fallback
    template = (
        "### ✉️ Academic Email Template (LangGraph Generated)\n\n"
        "**Subject:** [Course Code] - Inquiry / Request - [Your Full Name] - [Student ID]\n\n"
        "Dear Professor [Professor's Last Name],\n\n"
        "I hope you are having a productive week.\n\n"
        "I am writing to respectfully request [briefly mention request, e.g., *a 2-day extension on Assignment 2 / an appointment during office hours*]. "
        "Due to [brief, honest academic reason], I want to ensure my submission meets the highest academic standard.\n\n"
        "Would it be acceptable to [state proposed solution, e.g., *submit by Friday at 5:00 PM*]? I have already completed the initial draft and can share my notes if helpful.\n\n"
        "Thank you very much for your time and guidance.\n\n"
        "Sincerely,  \n"
        "**[Your Full Name]**  \n"
        "Student ID: [Your ID]  \n"
        "[Course Name & Section]"
    )
    return {"messages": [AIMessage(content=template)]}


def study_node(state: StudentState) -> dict:
    """Specialist node for explaining concepts, active recall, and Feynman technique."""
    llm = get_llm()
    if llm:
        persona = state.get("persona", "balanced")
        style_prompt = "Explain with clear analogies and step-by-step breakdowns."
        if persona == "eli5":
            style_prompt = "Use the Feynman Technique: explain like I'm 5 with zero jargon and vivid everyday analogies."
        elif persona == "concise":
            style_prompt = "Provide high-yield bullet points for quick pre-exam cramming."

        sys = SystemMessage(content=(
            f"You are UniBot's Master Study Coach. {style_prompt} "
            "Help university students master difficult lecture concepts, design active recall quizzes, and build study schedules."
        ))
        response = llm.invoke([sys] + state["messages"])
        return {"messages": [response]}

    fallback = (
        "### 🎯 The Feynman Study Technique (LangGraph Study Coach)\n\n"
        "To master any complex university topic:\n"
        "1. **Choose the concept:** Write the title at the top of a blank page.\n"
        "2. **Teach it to a 12-year-old:** Explain it using simple, everyday language without textbook jargon.\n"
        "3. **Identify your knowledge gaps:** When you hesitate or use complex buzzwords, return to your lecture slides.\n"
        "4. **Refine and simplify:** Create an intuitive real-world analogy to solidify memory."
    )
    return {"messages": [AIMessage(content=fallback)]}


def gpa_node(state: StudentState) -> dict:
    """Specialist node for GPA calculation and academic grading scales."""
    llm = get_llm()
    if llm:
        sys = SystemMessage(content=(
            "You are UniBot's Academic Advisor specializing in GPA calculations. "
            "Help students calculate their GPA step-by-step using weighted quality points. Show the formula clearly in Markdown."
        ))
        response = llm.invoke([sys] + state["messages"])
        return {"messages": [response]}

    fallback = (
        "### 🧮 GPA Calculation Formula (LangGraph Advisor)\n\n"
        "$$\\text{GPA} = \\frac{\\sum (\\text{Grade Point} \\times \\text{Credits})}{\\sum \\text{Total Credits}}$$\n\n"
        "**Standard 4.0 Grading Scale:**\n"
        "- **A (4.0):** 93-100%\n"
        "- **A- (3.7):** 90-92%\n"
        "- **B+ (3.3):** 87-89%\n"
        "- **B (3.0):** 83-86%\n"
        "- **B- (2.7):** 80-82%\n"
        "- **C (2.0):** 73-76%\n\n"
        "*Tip: Multiply each course's credit hours by its grade point, sum them up, and divide by total credits!*"
    )
    return {"messages": [AIMessage(content=fallback)]}


def citation_node(state: StudentState) -> dict:
    """Specialist node for APA, MLA, IEEE, and Chicago citations."""
    llm = get_llm()
    if llm:
        sys = SystemMessage(content=(
            "You are UniBot's Academic Citation Expert. Format references accurately in APA 7th, MLA 9th, "
            "Chicago, or IEEE style based on student inputs. Always show both in-text citation and bibliography format."
        ))
        response = llm.invoke([sys] + state["messages"])
        return {"messages": [response]}

    fallback = (
        "### 📖 Citation Quick Formats (LangGraph Citation Expert)\n\n"
        "**1. APA 7th Edition (Social Sciences):**\n"
        "- *Book:* Author, A. A. (Year). *Book Title in Italics*. Publisher.\n"
        "- *In-Text:* (Author, Year, p. 12)\n\n"
        "**2. MLA 9th Edition (Humanities):**\n"
        "- *Book:* Author Last, First. *Book Title*. Publisher, Year.\n"
        "- *In-Text:* (Author 12)\n\n"
        "**3. IEEE (Engineering & CS):**\n"
        "- *Reference:* [1] A. Author, *Title*, City: Publisher, Year.\n"
        "- *In-Text:* [1]"
    )
    return {"messages": [AIMessage(content=fallback)]}


def general_tutor_node(state: StudentState) -> dict:
    """General academic tutor and campus guidance node."""
    llm = get_llm()
    if llm:
        sys = SystemMessage(content=(
            "You are UniBot, a friendly and knowledgeable AI university companion. "
            "Help college students with exam prep, coursework questions, time management, and campus life. "
            "Uphold academic integrity by guiding students to understand concepts rather than giving direct cheat answers."
        ))
        response = llm.invoke([sys] + state["messages"])
        return {"messages": [response]}

    fallback = (
        "### 🎓 UniBot Campus Assistant (LangGraph)\n\n"
        "I'm your university student AI assistant! I can help you with:\n"
        "- ✉️ Drafting polite professor emails (extensions, meetings)\n"
        "- 🧮 Calculating your semester GPA on a 4.0 scale\n"
        "- 📖 APA / MLA citation formatting\n"
        "- 🎯 Explaining difficult syllabus topics and exam prep\n\n"
        "*Set `GEMINI_API_KEY` in `.env` or settings to enable full generative responses on any lecture topic!*"
    )
    return {"messages": [AIMessage(content=fallback)]}


# 5. Build the LangGraph Workflow
def build_student_graph():
    builder = StateGraph(StudentState)

    # Add Nodes
    builder.add_node("router", route_intent)
    builder.add_node("email_agent", email_node)
    builder.add_node("study_agent", study_node)
    builder.add_node("gpa_agent", gpa_node)
    builder.add_node("citation_agent", citation_node)
    builder.add_node("general_agent", general_tutor_node)

    # Add Edges
    builder.add_edge(START, "router")

    # Conditional Branching Edge from Router to Specialized Agents
    def branch_by_intent(state: StudentState) -> Literal["email_agent", "study_agent", "gpa_agent", "citation_agent", "general_agent"]:
        intent = state.get("intent", "general")
        mapping = {
            "email": "email_agent",
            "study": "study_agent",
            "gpa": "gpa_agent",
            "citation": "citation_agent",
            "general": "general_agent"
        }
        return mapping.get(intent, "general_agent")

    builder.add_conditional_edges(
        "router",
        branch_by_intent,
        {
            "email_agent": "email_agent",
            "study_agent": "study_agent",
            "gpa_agent": "gpa_agent",
            "citation_agent": "citation_agent",
            "general_agent": "general_agent",
        }
    )

    # Connect all agents to END
    builder.add_edge("email_agent", END)
    builder.add_edge("study_agent", END)
    builder.add_edge("gpa_agent", END)
    builder.add_edge("citation_agent", END)
    builder.add_edge("general_agent", END)

    return builder.compile()


# Compiled Singleton Graph
student_graph = build_student_graph()


# Convenient helper to invoke graph
def ask_student_bot(user_query: str, history: list = None, persona: str = "balanced") -> str:
    messages = []
    if history:
        for item in history:
            role = item.get("role")
            text = item.get("text", "")
            if role == "user":
                messages.append(HumanMessage(content=text))
            elif role == "model" or role == "assistant":
                messages.append(AIMessage(content=text))

    messages.append(HumanMessage(content=user_query))

    state = {
        "messages": messages,
        "intent": "general",
        "persona": persona
    }

    result = student_graph.invoke(state)
    last_message = result["messages"][-1]
    return last_message.content


if __name__ == "__main__":
    # Quick CLI test
    print("Testing LangGraph University Bot...")
    test_q = "How do I ask my professor for an extension?"
    ans = ask_student_bot(test_q)
    print(f"\nQ: {test_q}\nA:\n{ans}\n")
