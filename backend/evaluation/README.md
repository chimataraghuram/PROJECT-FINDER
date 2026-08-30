# RAG evaluation

`rag_questions.json` is the initial benchmark dataset. Each item records the expected evidence source types. Evaluation results are stored through `/api/evaluations` with retrieval metrics such as Recall@K, Precision@K, MRR, NDCG, groundedness, citation correctness, and latency.

The current semantic implementation is a deterministic local baseline. Compare `lexical`, `semantic`, and `hybrid` runs against the same indexed repositories and sample set.
