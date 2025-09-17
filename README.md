# ⚠️ 위험성평가 시스템

산업안전보건법에 따른 위험성평가를 체계적으로 관리하는 웹 애플리케이션입니다.

## 🎯 주요 기능

### 📄 표지 관리
- 회사 정보 입력 및 관리
- 결재 정보 관리
- 평가 기본 정보 설정

### ⚙️ 작업공정 분석
- 사업장 개요 정보 입력
- 공정도 작성 및 관리
- 공정별 상세 정보 입력
- 기계기구, 유해물질, 위험요인 관리

### ℹ️ 위험정보 관리
- 원재료 정보 관리
- 기계기구 및 설비 정보
- 유해화학물질 정보
- 작업공정 데이터와 자동 연동

### 📊 위험성평가
- 유해위험요인 체계적 분석
- 위험도 평가 (가능성 × 중대성)
- 위험성 등급 자동 계산
- 개선 대책 및 계획 수립

### 📈 보고서 및 분석
- 위험성 분포 시각화
- 데이터 요약 및 통계
- JSON/Excel 파일 내보내기

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/risk-assessment.git
cd risk-assessment
```

### 2. 가상환경 생성 및 활성화
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. 의존성 설치
```bash
pip install -r requirements.txt
```

### 4. 애플리케이션 실행
```bash
streamlit run app.py
```

### 5. 브라우저에서 접속
```
http://localhost:8501
```

## 📦 의존성

- **streamlit**: 웹 애플리케이션 프레임워크
- **pandas**: 데이터 처리 및 분석
- **matplotlib**: 데이터 시각화
- **openpyxl**: Excel 파일 처리
- **plotly**: 인터랙티브 차트
- **seaborn**: 통계적 데이터 시각화
- **numpy**: 수치 계산

## 🏗️ 프로젝트 구조

```
risk-assessment/
├── app.py                 # 메인 Streamlit 애플리케이션
├── requirements.txt       # Python 의존성 목록
├── README.md             # 프로젝트 문서
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions 배포 워크플로우
├── data/                 # 데이터 저장 디렉토리
│   ├── title_page.json
│   ├── work_process.json
│   ├── risk_info.json
│   └── risk_assessment.json
└── assets/               # 정적 파일 (이미지, 아이콘 등)
```

## 🌐 Streamlit Cloud 배포

### 1. GitHub 저장소 준비
- 모든 파일을 GitHub 저장소에 푸시
- `requirements.txt` 파일이 루트 디렉토리에 있는지 확인

### 2. Streamlit Cloud에서 배포
1. [Streamlit Cloud](https://share.streamlit.io/) 접속
2. "New app" 클릭
3. GitHub 저장소 선택
4. 브랜치 선택 (보통 `main`)
5. 메인 파일 경로: `app.py`
6. "Deploy!" 클릭

### 3. 환경 변수 설정 (필요시)
- Streamlit Cloud 대시보드에서 환경 변수 설정 가능
- 데이터베이스 연결 정보 등 민감한 정보는 환경 변수로 관리

## 📊 데이터 관리

### 로컬 데이터 저장
- 모든 데이터는 `data/` 디렉토리에 JSON 파일로 저장
- 세션 간 데이터 유지
- 브라우저 새로고침 시에도 데이터 보존

### 데이터 내보내기
- **JSON 형식**: 전체 데이터 백업
- **Excel 형식**: 보고서 작성용
- **CSV 형식**: 데이터 분석용

## 🔧 개발 가이드

### 새로운 페이지 추가
1. `app.py`의 페이지 선택 메뉴에 새 페이지 추가
2. 해당 페이지의 UI 및 로직 구현
3. 데이터 모델 정의 및 저장 로직 추가

### 데이터 모델 확장
```python
# 새로운 데이터 타입 추가 예시
new_data_type = {
    'field1': 'value1',
    'field2': 'value2',
    'timestamp': datetime.now().isoformat()
}
```

### 스타일 커스터마이징
- CSS 스타일은 `st.markdown()` 함수 내에서 정의
- Streamlit 테마 설정으로 전체적인 색상 변경 가능

## 🛡️ 보안 고려사항

- 민감한 데이터는 환경 변수로 관리
- 파일 업로드 시 파일 타입 검증
- XSS 공격 방지를 위한 입력 데이터 검증
- HTTPS 사용 권장

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 GitHub Issues를 통해 연락해 주세요.

## 🔄 업데이트 로그

### v1.0.0 (2025-01-01)
- 초기 버전 릴리스
- 기본 위험성평가 기능 구현
- Streamlit Cloud 배포 지원

---

**⚠️ 주의사항**: 이 시스템은 산업안전보건법에 따른 위험성평가를 지원하는 도구입니다. 실제 법적 요구사항을 충족하는지 확인하고 사용하시기 바랍니다.

