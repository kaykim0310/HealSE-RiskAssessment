# 위험성평가 통합 시스템 Streamlit 애플리케이션

이 프로젝트는 작업장 위험성 평가를 수행하고 관리하기 위한 웹 애플리케이션으로, Streamlit을 사용하여 제작되었습니다. 다중 탭 구조의 HTML 프로토타입을 기반으로 하며, 산업안전보건법규 데이터베이스를 활용합니다.

## 주요 기능

-   **다중 탭 인터페이스**: 표지부터 개선활동까지 총 7단계의 안내식 프로세스 제공
-   **동적 양식**: 작업 공정, 원재료, 설비 등을 동적으로 추가하고 관리
-   **데이터 기반 위험요인 선택**: 사전에 정의된 분류에 따라 위험요인 분류
-   **상호작용 가능한 평가표**: 스프레드시트와 유사한 인터페이스로 위험성 평가 수행
-   **위험성 자동 계산**: 가능성(빈도)과 중대성(강도)에 따라 위험성 등급 자동 계산
-   **엑셀 보고서 생성**: 입력된 모든 데이터를 다중 시트로 구성된 엑셀 보고서로 다운로드

## 설치 방법

1.  **GitHub 리포지토리 복제:**
    ```bash
    git clone <your-github-repo-url>
    cd risk-assessment-app
    ```

2.  **가상환경 생성 (권장):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    ```

3.  **필요 라이브러리 설치:**
    ```bash
    pip install -r requirements.txt
    ```

## 실행 방법

1.  데이터 파일(`DBRAclass-OSHregulatory.csv`)이 `data/` 폴더 안에 있는지 확인하세요.

2.  터미널에서 아래 명령어로 Streamlit 애플리케이션을 실행하세요:
    ```bash
    streamlit run app.py
    ```

3.  웹 브라우저에서 실행 중인 애플리케이션이 자동으로 열립니다.