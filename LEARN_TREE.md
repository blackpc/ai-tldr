# Learn AI — Article Tree

Full content map of the `/learn` section. Generated from `src/data/learn/taxonomy.json` on 2026-06-12.

```
* LLM Fundamentals
    + LLM Basics
        -> What Is a Large Language Model (LLM)? A Plain-English Guide
        -> How Do LLMs Actually Work? Next-Token Prediction Explained
        -> Why Do LLMs Need GPUs? AI Compute Explained for Beginners
        -> What Are AI Scaling Laws? Why Bigger Models Got Smarter
        -> How Does ChatGPT Work? A Plain-English Explanation
    + Tokens & Tokenization
        -> What Is a Token in an LLM? Tokenization Explained for Beginners
        -> Tokens vs Words vs Characters: How to Estimate Text Size
        -> How Does Tokenization Work? Byte-Pair Encoding in Plain English
        -> Why Can't LLMs Count the R's in "Strawberry"? Tokenizer Quirks
    + Transformers & Attention
        -> What Is a Transformer Model? The Architecture Behind LLMs
        -> How Does Attention Work in LLMs? A Visual Beginner's Guide
        -> What Is a Mixture-of-Experts (MoE) Model?
        -> What Is FlashAttention? Faster Attention, Same Math
    + How Text Generation Works
        -> What Is Next-Token Prediction? How LLMs Actually Generate Text
        -> What Is Autoregressive Generation? How LLMs Write One Token at a Time
        -> Logits in an LLM: Raw Scores to a Logits Probability Distribution
        -> Softmax Function Machine Learning Guide: Turning Scores Into Probabilities
        -> Token Sampling vs Greedy Decoding: How an LLM Picks the Next Token
    + Context Windows & Model Memory
        -> What Is a Context Window? LLM Memory Limits Explained
        -> What Happens When You Exceed the Context Window?
        -> What Is the 'Lost in the Middle' Problem in Long-Context Models?
        -> How Do Million-Token Context Windows Actually Work?
    + Sampling, Temperature & Hallucination
        -> What Is Temperature in an LLM? (And What Should You Set It To?)
        -> Why Do LLMs Hallucinate? Causes and Practical Fixes
        -> Top-p vs Top-k Sampling: How LLMs Pick the Next Token
        -> What Is a Knowledge Cutoff? Why Models Don't Know Yesterday's News

* Prompt Engineering
    + Prompting Basics
        -> What Is Prompt Engineering? (and Why It Still Matters)
    + Reasoning Techniques
        -> What Is Chain-of-Thought Prompting? (and When It Helps)
    + Context Engineering
        -> What Is Context Engineering? Managing What the Model Sees
    + Prompt Injection & Security
        -> What Is Prompt Injection? The #1 LLM Security Risk Explained
    + Prompt Iteration & Management
        -> What Is Prompt Management? Versioning and Testing Prompts Like Code

* Working with LLM APIs
    + API Basics
        -> What Is an LLM API? Calling AI Models Over HTTP, Explained
    + Provider Guides
        -> What Is the Claude API? A Beginner's Guide to Building with Anthropic
    + Streaming & Structured Outputs
        -> What Is Streaming in LLM APIs? Server-Sent Events Explained
    + Function Calling
        -> What Is Function Calling? How LLMs Trigger Your Code, Step by Step
    + Cost, Caching & Rate Limits
        -> How LLM API Pricing Works: Input, Output, and Cached Tokens

* Embeddings & Vector Databases
    + Embeddings Explained
        -> What Are Embeddings? Vectors That Capture Meaning
    + Similarity Search & Indexing
        -> What Is Semantic Search? Finding Meaning, Not Keywords
    + Vector Database Guides
        -> What Is a Vector Database? (and When You Actually Need One)
    + Vectors in Production
        -> How to Choose a Vector Database: A Decision Framework

* Retrieval-Augmented Generation (RAG)
    + RAG Fundamentals
        -> What Is RAG? Retrieval-Augmented Generation Explained for Beginners
    + Chunking & Ingestion
        -> What Is Chunking in RAG? Why Document Splitting Matters
    + Retrieval & Reranking
        -> What Is a Retriever? How RAG Finds the Right Documents
    + Advanced RAG Architectures
        -> What Is Agentic RAG? When the LLM Decides What to Search
    + RAG Evaluation
        -> How Do You Evaluate a RAG System? The Metrics That Matter

* AI Agents
    + Agent Fundamentals
        -> What Is an AI Agent? A Plain-English Guide
    + Tool Use & Tool Design
        -> What Is Tool Use in AI Agents? From Function Calls to Actions
    + Model Context Protocol (MCP)
        -> What Is MCP (Model Context Protocol)? The USB-C of AI Tools
    + Planning & Memory
        -> What Is Agent Planning? How AI Breaks Down Big Tasks
    + Multi-Agent Systems & Computer Use
        -> What Is a Multi-Agent System? When One Agent Isn't Enough

* Agent SDKs & Frameworks
    + Choosing a Framework
        -> What Is an Agent Framework? (and Do You Even Need One?)
    + Provider Agent SDKs
        -> What Is the Claude Agent SDK? Building Agents the Claude Code Way
    + LangChain & LangGraph
        -> What Is LangChain? (and What It's Actually For)
    + Orchestration Frameworks
        -> What Is LlamaIndex? The Data Framework for RAG and Agents
    + Lightweight & Typed Frameworks
        -> What Is DSPy? Programming LLMs Instead of Prompting Them

* AI Coding & Developer Tools
    + AI Coding Fundamentals
        -> What Is an AI Coding Assistant? From Autocomplete to Autonomous
    + Coding Agents & Assistants
        -> What Is Claude Code? A Beginner's Guide
    + AI Coding Workflows
        -> How to Prompt a Coding Agent Effectively

* Fine-Tuning & Model Customization
    + Fine-Tuning Fundamentals
        -> What Is Fine-Tuning an LLM? A Beginner's Guide
        -> LLM Pretraining vs Fine-Tuning: How Models Are Actually Trained
    + LoRA & Efficient Methods
        -> What Is LoRA? Low-Rank Adaptation Explained Simply
    + RLHF & Preference Training
        -> What Is RLHF? How Models Learn from Human Feedback
    + Distillation & Training Tools
        -> What Is Model Distillation? Big-Model Quality at Small-Model Prices

* Local & Open Models
    + Running Models Locally
        -> What Is a Local LLM? Why Run Models on Your Own Machine
    + Quantization & Model Formats
        -> What Is Quantization? Shrinking Models to Fit Your GPU
    + The Open Model Ecosystem
        -> What Is Hugging Face? The GitHub of Machine Learning Explained
    + Inference & Serving Engines
        -> What Is an Inference Server? Serving LLMs to Many Users

* Multimodal AI
    + Vision & Document Understanding
        -> What Is a Vision Language Model (VLM)? LLMs That Can See
    + Speech & Voice
        -> What Is Speech-to-Text? How Whisper-Style ASR Models Work
    + Image Generation
        -> What Is a Diffusion Model? How AI Image Generation Works
    + Video, Audio & Beyond
        -> How Does AI Video Generation Work? Text-to-Video Explained

* Production & LLMOps
    + LLMOps Fundamentals
        -> What Is LLMOps? Running LLM Apps in Production
    + Observability & Monitoring
        -> What Is LLM Observability? Logs, Traces, and Tokens
    + Cost & Latency Optimization
        -> What Is Semantic Caching? Reusing Answers to Similar Questions
    + Guardrails & Reliability
        -> What Are LLM Guardrails? Input and Output Validation for AI Apps
    + Testing & Deployment
        -> How Do You Test LLM Apps? Strategies for Nondeterministic Code

* Evaluation & Safety
    + Evaluation Basics
        -> What Are LLM Evals? Why "It Looks Good" Isn't Enough
    + LLM-as-a-Judge
        -> What Is LLM-as-a-Judge? Using Models to Grade Models
    + Benchmarks & Leaderboards
        -> What Are LLM Benchmarks? MMLU, GPQA, and Friends Explained
    + Red Teaming & Jailbreaks
        -> What Is AI Red Teaming? Attacking Your Own AI First
    + Alignment & Safety Basics
        -> What Is AI Alignment? The Problem Explained Without the Hype

* Building AI Apps
    + First Projects
        -> What Should You Build First? AI Project Ideas for Beginners
    + The AI App Stack
        -> What Is the Modern AI App Stack? The Pieces of an LLM Application
    + AI UX Patterns
        -> What Makes Good AI UX? Patterns from the Best AI Products
    + AI Engineering Career
        -> What Is an AI Engineer? The Role, Skills, and Path Explained

== 14 categories | 64 subcategories | 85 articles ==
```

