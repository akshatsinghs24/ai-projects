# cli.py - Interactive Terminal CLI for UniBot (LangGraph)
import os
import sys

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from graph import ask_student_bot

def main():
    print("=" * 60)
    print("🎓 UniBot CLI - University AI Assistant powered by LangGraph")
    print("=" * 60)
    print("Type your question below (or 'exit' to quit).\n")
    print("Quick examples:")
    print("  - 'Draft an email to my professor asking for an extension'")
    print("  - 'How do I calculate GPA with 4 credits of A and 3 of B+'")
    print("  - 'Explain the Feynman Technique for studying'")
    print("  - 'How do I cite a journal in APA 7th?'")
    print("-" * 60 + "\n")

    history = []

    while True:
        try:
            user_input = input("Student 🧑: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "q"]:
                print("\nGood luck with your studies! 👋🎓\n")
                break

            print("\nUniBot (LangGraph) 🎓: Thinking...")
            response = ask_student_bot(user_input, history=history)
            print(f"\n{response}\n")
            print("-" * 60 + "\n")

            history.append({"role": "user", "text": user_input})
            history.append({"role": "model", "text": response})

        except (KeyboardInterrupt, EOFError):
            print("\n\nGoodbye! 👋\n")
            break

if __name__ == "__main__":
    main()
