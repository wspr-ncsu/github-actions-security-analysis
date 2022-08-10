# GitHub Actions Security Analysis

# Project Contents
1. `artifacts/` contains dataset of workflows of public repositories we crawled from GitHub
2. `gwchecker/` contains our action that can be used to check the workflows inside repository
3. `poc-actions/` contains proof of concept actions that can be used to circumvent security properties

# Research Paper
Our work was published at Usenix Security'22 as following paper:

**Characterizing the Security of GitHub CI Workflows** [[PDF]](https://www.usenix.org/system/files/sec22-koishybayev.pdf)

Igibek Koishybayev and Aleksandr Nahapetyan, North Carolina State University; Raima Zachariah, Independent Researcher; Siddharth Muralee, Purdue University; Bradley Reaves and Alexandros Kapravelos, North Carolina State University; Aravind Machiry, Purdue University

31st USENIX Security Symposium (USENIX Security 22)

```
@inproceedings {github-usenix22,
title = {Characterizing the Security of Github {CI} Workflows},
author = {Igibek Koishybayev and Aleksandr Nahapetyan and Raima Zachariah and Siddharth Muralee and Bradley Reaves and Alexandros Kapravelos and Aravind Machiry},
booktitle = {31st USENIX Security Symposium (USENIX Security 22)},
year = {2022},
isbn = {978-1-939133-31-1}
}
```