import streamlit as st
import pandas as pd
import json
import os
from datetime import datetime
import base64
from io import BytesIO
import zipfile

# 페이지 설정
st.set_page_config(
    page_title="위험성평가 시스템",
    page_icon="⚠️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS 스타일
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 2rem 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    
    .section-header {
        background: #f7fafc;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border-left: 4px solid #667eea;
    }
    
    .stButton > button {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-weight: 600;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .risk-high { background-color: #fed7d7 !important; color: #c53030; }
    .risk-medium { background-color: #feebc8 !important; color: #c05621; }
    .risk-low { background-color: #c6f6d5 !important; color: #276749; }
    
    /* HTML iframe 스타일 */
    .html-container {
        width: 100%;
        height: 800px;
        border: none;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
</style>
""", unsafe_allow_html=True)

# HTML 파일을 읽어서 표시하는 함수
def display_html_file(filename):
    """HTML 파일을 Streamlit에서 표시"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # HTML 내용을 base64로 인코딩
        html_bytes = html_content.encode('utf-8')
        html_b64 = base64.b64encode(html_bytes).decode()
        
        # iframe으로 HTML 표시
        st.markdown(f"""
        <iframe src="data:text/html;base64,{html_b64}" 
                class="html-container" 
                frameborder="0">
        </iframe>
        """, unsafe_allow_html=True)
        
    except FileNotFoundError:
        st.error(f"파일을 찾을 수 없습니다: {filename}")
    except Exception as e:
        st.error(f"HTML 파일을 표시하는 중 오류가 발생했습니다: {str(e)}")

# 메인 헤더
st.markdown("""
<div class="main-header">
    <h1>⚠️ 위험성평가 시스템</h1>
    <p>산업안전보건법에 따른 위험성평가를 체계적으로 관리하세요</p>
</div>
""", unsafe_allow_html=True)

# 사이드바 네비게이션
st.sidebar.title("📋 메뉴")
page = st.sidebar.selectbox(
    "페이지 선택",
    ["🏠 홈", "📄 표지", "⚙️ 작업공정", "ℹ️ 위험정보", "📊 위험성평가", "📈 통합 시스템"]
)

# 홈 페이지
if page == "🏠 홈":
    st.markdown("""
    <div class="section-header">
        <h2>🎯 위험성평가 시스템 개요</h2>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        ### 📄 표지
        - 회사 정보 입력
        - 결재 정보 관리
        - 평가 기본 정보
        """)
        if st.button("표지 페이지로 이동", key="nav_title"):
            st.session_state.page = "📄 표지"
            st.rerun()
    
    with col2:
        st.markdown("""
        ### ⚙️ 작업공정
        - 사업장 개요
        - 공정도 작성
        - 공정별 상세 정보
        """)
        if st.button("작업공정 페이지로 이동", key="nav_process"):
            st.session_state.page = "⚙️ 작업공정"
            st.rerun()
    
    with col3:
        st.markdown("""
        ### ℹ️ 위험정보
        - 원재료 정보
        - 기계기구 정보
        - 유해화학물질 정보
        """)
        if st.button("위험정보 페이지로 이동", key="nav_risk_info"):
            st.session_state.page = "ℹ️ 위험정보"
            st.rerun()
    
    st.markdown("""
    <div class="section-header">
        <h2>📊 위험성평가</h2>
        <p>유해위험요인을 체계적으로 분석하고 위험도를 평가합니다.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if st.button("위험성평가 페이지로 이동", key="nav_assessment"):
        st.session_state.page = "📊 위험성평가"
        st.rerun()
    
    st.markdown("""
    <div class="section-header">
        <h2>🌐 통합 시스템</h2>
        <p>모든 기능이 통합된 HTML 시스템을 사용하세요.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if st.button("통합 시스템으로 이동", key="nav_integrated"):
        st.session_state.page = "📈 통합 시스템"
        st.rerun()

# 표지 페이지
elif page == "📄 표지":
    st.markdown("""
    <div class="section-header">
        <h2>📄 위험성평가 결과서 - 표지</h2>
    </div>
    """, unsafe_allow_html=True)
    
    # HTML 파일 표시
    display_html_file("RA(1)-title.html")

# 작업공정 페이지
elif page == "⚙️ 작업공정":
    st.markdown("""
    <div class="section-header">
        <h2>⚙️ 작업공정 분석</h2>
    </div>
    """, unsafe_allow_html=True)
    
    # HTML 파일 표시
    display_html_file("RA(2)-WorkProcess.html")

# 위험정보 페이지
elif page == "ℹ️ 위험정보":
    st.markdown("""
    <div class="section-header">
        <h2>ℹ️ 위험정보</h2>
    </div>
    """, unsafe_allow_html=True)
    
    # HTML 파일 표시
    display_html_file("RA(3)-RiskInfo.html")

# 위험성평가 페이지
elif page == "📊 위험성평가":
    st.markdown("""
    <div class="section-header">
        <h2>📊 위험성평가표</h2>
    </div>
    """, unsafe_allow_html=True)
    
    # HTML 파일 표시
    display_html_file("RA(4)_riskAssessment.html")

# 통합 시스템 페이지
elif page == "📈 통합 시스템":
    st.markdown("""
    <div class="section-header">
        <h2>🌐 위험성평가 통합 시스템</h2>
    </div>
    """, unsafe_allow_html=True)
    
    # 통합 HTML 파일 표시
    display_html_file("integrated-risk-assessment.html")

# 푸터
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 1rem;">
    <p>⚠️ 위험성평가 시스템 | 산업안전보건법 준수</p>
    <p>© 2025 Risk Assessment System. All rights reserved.</p>
</div>
""", unsafe_allow_html=True)