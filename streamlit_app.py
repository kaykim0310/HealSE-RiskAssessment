import streamlit as st
import streamlit.components.v1 as components
import os
from pathlib import Path

# 페이지 설정
st.set_page_config(
    page_title="위험성평가 통합 시스템",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# CSS 숨김
hide_streamlit_style = """
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.stApp > div:first-child {padding-top: 0;}
</style>
"""
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

# 파일 경로 설정
current_dir = Path(__file__).parent
html_file = current_dir / "index.html"

# HTML 파일 읽기
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# 정적 파일 경로 수정 (Streamlit 배포용)
html_content = html_content.replace('href="css/', 'href="app/static/css/')
html_content = html_content.replace('src="js/', 'src="app/static/js/')

# iframe으로 HTML 렌더링
components.html(
    html_content,
    height=900,
    scrolling=True
)

# 사이드바에 정보 표시
with st.sidebar:
    st.title("📋 사용 안내")
    st.markdown("""
    ### 위험성평가 통합 시스템 v2.0
    
    **주요 기능:**
    - 체계적인 위험성평가 프로세스
    - 법규 데이터 자동 매칭
    - 엑셀/PDF 리포트 생성
    
    **사용 방법:**
    1. 법규 엑셀 파일 업로드
    2. 단계별 평가 진행
    3. 리포트 다운로드
    
    **문의:** safety@company.com
    """)
    
    # 파일 업로드 (법규 데이터)
    st.markdown("---")
    st.markdown("### 📁 법규 데이터 업로드")
    uploaded_file = st.file_uploader(
        "엑셀 파일 선택",
        type=['xlsx', 'xls'],
        help="대분류 | 중분류 | 법규 형식의 엑셀 파일"
    )
    
    if uploaded_file is not None:
        st.success("파일이 업로드되었습니다!")
        # JavaScript로 파일 전달하는 로직 필요

# 푸터
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center; color: #718096; font-size: 0.9rem;'>
        © 2024 위험성평가 통합 시스템. All rights reserved.
    </div>
    """,
    unsafe_allow_html=True
)