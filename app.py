import streamlit as st
import pandas as pd
import io
from datetime import datetime

# --- 페이지 설정 ---
st.set_page_config(
    page_title="위험성평가 통합 시스템",
    page_icon="⚠️",
    layout="wide"
)

# --- 데이터 로딩 (성능을 위해 캐시 사용) ---
@st.cache_data
def load_legal_data():
    """CSV 파일에서 법규 데이터를 로드합니다."""
    try:
        # CSV 파일의 인코딩을 'utf-8-sig'로 지정하여 BOM(Byte Order Mark) 문제 해결
        df = pd.read_csv('data/DBRAclass-OSHregulatory.csv', encoding='utf-8-sig')
        return df
    except FileNotFoundError:
        st.error("오류: 'data/DBRAclass-OSHregulatory.csv' 파일을 찾을 수 없습니다. 프로젝트 구조를 확인하세요.")
        return pd.DataFrame()

# 데이터 로드
legal_df = load_legal_data()
HAZARD_CATEGORIES = {}
if not legal_df.empty:
    # '대분류 위험 요인'과 '중분류 위험 요인' 열이 존재하는지 확인
    if '대분류 위험 요인' in legal_df.columns and '중분류 위험 요인' in legal_df.columns:
        HAZARD_CATEGORIES = {
            '기계(설비)적 요인': legal_df[legal_df['대분류 위험 요인'] == '기계(설비)적 요인']['중분류 위험 요인'].unique().tolist(),
            '전기적 요인': legal_df[legal_df['대분류 위험 요인'] == '전기적 요인']['중분류 위험 요인'].unique().tolist(),
            '화학(물질)적 요인': legal_df[legal_df['대분류 위험 요인'] == '화학(물질)적 요인']['중분류 위험 요인'].unique().tolist(),
            '생물학적 요인': legal_df[legal_df['대분류 위험 요인'] == '생물학적 요인']['중분류 위험 요인'].unique().tolist(),
            '작업특성 요인': legal_df[legal_df['대분류 위험 요인'] == '작업특성 요인']['중분류 위험 요인'].unique().tolist(),
            '작업환경 요인': legal_df[legal_df['대분류 위험 요인'] == '작업환경 요인']['중분류 위험 요인'].unique().tolist(),
        }
    else:
        st.error("CSV 파일에 '대분류 위험 요인' 또는 '중분류 위험 요인' 열이 없습니다.")


# --- 세션 상태 초기화 ---
def initialize_session_state():
    """세션 상태 변수가 없으면 초기화합니다."""
    if 'app_data' not in st.session_state:
        st.session_state.app_data = {
            "company_info": {"name": "", "address": "", "tel": "", "fax": ""},
            "workplace_info": {"ceo": "", "products": "", "employees": 0, "eval_date": datetime.now().date(), "evaluator": ""},
            "processes": [
                {"name": "공정 1", "description": "", "materials": [], "equipment": [], "chemicals": [], "hazards": {}, "assessments": pd.DataFrame()}
            ],
            "reduction_plan": pd.DataFrame(),
            "improvement_plan": pd.DataFrame(),
            "current_process_index": 0
        }
    if 'risk_assessment_df' not in st.session_state:
         st.session_state.risk_assessment_df = pd.DataFrame()


initialize_session_state()
app_data = st.session_state.app_data

# --- 도우미 함수 ---
def to_excel(df_dict):
    """데이터프레임 딕셔너리를 메모리 상의 엑셀 파일로 변환합니다."""
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        for sheet_name, df in df_dict.items():
            df.to_excel(writer, sheet_name=sheet_name, index=False)
    processed_data = output.getvalue()
    return processed_data

def get_legal_basis_for_hazard(hazard_name):
    """주어진 위험 요인에 대한 관련 법규를 찾습니다."""
    if legal_df.empty or not hazard_name:
        return []
    matches = legal_df[legal_df['중분류 위험 요인'] == hazard_name]
    return matches['법규'].tolist()


# --- 각 탭의 UI 렌더링 함수 ---

def render_tab_title():
    """표지 탭을 렌더링합니다."""
    st.header(f"{datetime.now().year}년도 위험성평가 결과서", divider='rainbow')
    
    with st.expander("결재", expanded=True):
        cols = st.columns(4)
        roles = ["담당자", "팀장", "부서장", "대표이사"]
        for i, col in enumerate(cols):
            with col:
                st.text_input(f"직위 {i+1}", value=roles[i], key=f"role_{i}")
                st.text_input(f"서명 {i+1}", placeholder="서명", key=f"sign_{i}", type="password")

    st.subheader("사업장 정보")
    app_data['company_info']['name'] = st.text_input("회사명", value=app_data['company_info']['name'])
    app_data['company_info']['address'] = st.text_input("주소", value=app_data['company_info']['address'])
    col1, col2 = st.columns(2)
    with col1:
        app_data['company_info']['tel'] = st.text_input("전화번호", value=app_data['company_info']['tel'])
    with col2:
        app_data['company_info']['fax'] = st.text_input("팩스번호", value=app_data['company_info']['fax'])


def render_tab_process():
    """작업공정 분석 탭을 렌더링합니다."""
    st.header("작업공정 분석", divider='rainbow')
    
    st.subheader("1. 사업장 개요")
    info = app_data['workplace_info']
    info['name'] = st.text_input("사업장명", value=app_data['company_info']['name'], disabled=True)
    info['ceo'] = st.text_input("대표자", value=info['ceo'])
    
    col1, col2 = st.columns(2)
    with col1:
        info['products'] = st.text_input("주요생산품", value=info['products'])
        info['eval_date'] = st.date_input("평가일자", value=info['eval_date'])
    with col2:
        info['employees'] = st.number_input("근로자수", min_value=0, value=info['employees'])
        info['evaluator'] = st.text_input("평가자", value=info['evaluator'])

    st.subheader("2. 공정도")
    for i, process in enumerate(app_data['processes']):
        with st.expander(f"공정 {i+1}: {process['name'] or '이름 없음'}", expanded=True):
            process['name'] = st.text_input("공정명", value=process.get('name', ''), key=f"proc_name_{i}")
            process['description'] = st.text_area("공정설명", value=process.get('description', ''), key=f"proc_desc_{i}")
    
    col1, col2 = st.columns([1, 5])
    if col1.button("➕ 공정 추가"):
        app_data['processes'].append({"name": f"공정 {len(app_data['processes']) + 1}", "description": "", "materials": [], "equipment": [], "chemicals": [], "hazards": {}, "assessments": pd.DataFrame()})
        st.rerun()
    if col2.button("➖ 마지막 공정 삭제", disabled=len(app_data['processes']) <= 1):
        app_data['processes'].pop()
        st.rerun()


def render_tab_risk_info():
    """위험정보 탭을 렌더링합니다."""
    st.header("위험정보", divider='rainbow')

    process_names = [p['name'] for p in app_data['processes']]
    if process_names:
        selected_process_name = st.selectbox(
            "관리할 공정을 선택하세요",
            options=process_names,
            index=app_data['current_process_index']
        )
        app_data['current_process_index'] = process_names.index(selected_process_name)
    else:
        st.warning("먼저 '작업공정' 탭에서 공정을 추가해주세요.")
        return

    current_process = app_data['processes'][app_data['current_process_index']]

    # 동적 항목 리스트 관리 함수
    def manage_list(title, item_list, key_prefix):
        st.subheader(title)
        for i, item in enumerate(item_list):
            col1, col2 = st.columns([4, 1])
            new_item = col1.text_input(f"항목 {i+1}", value=item, key=f"{key_prefix}_{i}", label_visibility="collapsed")
            item_list[i] = new_item
            if col2.button("삭제", key=f"{key_prefix}_del_{i}"):
                item_list.pop(i)
                st.rerun()

        if st.button(f"+ {title} 추가", key=f"{key_prefix}_add"):
            item_list.append("")
            st.rerun()

    manage_list("원(재)료", current_process.setdefault('materials', []), "mat")
    manage_list("기계기구 및 설비명", current_process.setdefault('equipment', []), "equip")
    manage_list("유해화학물질", current_process.setdefault('chemicals', []), "chem")


def render_tab_classification():
    """유해위험요인분류 탭을 렌더링합니다."""
    st.header("유해위험요인분류", divider='rainbow')

    process_names = [p['name'] for p in app_data['processes']]
    if not process_names:
        st.warning("먼저 '작업공정' 탭에서 공정을 추가해주세요.")
        return
        
    selected_process_name = st.selectbox(
        "분류할 공정을 선택하세요",
        options=process_names,
        index=app_data['current_process_index']
    )
    app_data['current_process_index'] = process_names.index(selected_process_name)
    current_process = app_data['processes'][app_data['current_process_index']]
    
    st.info(f"현재 공정: **{selected_process_name}**")

    if not HAZARD_CATEGORIES:
        st.warning("법규 데이터가 로드되지 않아 유해위험요인을 선택할 수 없습니다.")
        return

    current_hazards = current_process.setdefault('hazards', {})
    
    for category, hazards_list in HAZARD_CATEGORIES.items():
        with st.expander(f"**{category}**"):
            selected = st.multiselect(
                f"{category} 선택",
                options=sorted(hazards_list),
                default=current_hazards.get(category, []),
                label_visibility="collapsed"
            )
            current_hazards[category] = selected


def render_tab_assessment():
    """위험성평가표 탭을 렌더링합니다."""
    st.header("위험성평가표", divider='rainbow')
    
    process_names = [p['name'] for p in app_data['processes']]
    if not process_names:
        st.warning("먼저 '작업공정' 탭에서 공정을 추가해주세요.")
        return

    selected_process_name = st.selectbox(
        "평가할 공정을 선택하세요",
        options=process_names,
        index=app_data['current_process_index']
    )
    app_data['current_process_index'] = process_names.index(selected_process_name)
    current_process = app_data['processes'][app_data['current_process_index']]
    
    if st.button("🔄 선택된 유해위험요인으로 평가표 생성/갱신"):
        hazards_data = []
        for category, selected_hazards in current_process.get('hazards', {}).items():
            for hazard in selected_hazards:
                hazards_data.append({"분류": category, "유해 위험 요인": hazard})
        
        if hazards_data:
            df = pd.DataFrame(hazards_data)
            df['작업내용'] = ''
            df['원인'] = ''
            df['관련 법규'] = df['유해 위험 요인'].apply(lambda x: ", ".join(get_legal_basis_for_hazard(x)))
            df['현재상태 및 조치'] = ''
            df['가능성(빈도)'] = '보통(3)'
            df['중대성(강도)'] = '보통(2)'
            df['위험성'] = 6
            df['감소 대책'] = ''
            df['개선후 위험성'] = '낮음'
            df['개선 예정일'] = None
            df['완료일'] = None
            df['담당자'] = ''
            df['비고'] = ''
            current_process['assessments'] = df
        else:
            st.warning("'유해위험요인분류' 탭에서 요인을 먼저 선택해주세요.")
            current_process['assessments'] = pd.DataFrame()

    st.subheader("위험성 등급 기준 (가능성 x 중대성)")
    st.image("https://i.imgur.com/3LXd4UK.png", caption="위험성 등급 기준 (5x4 방식)")

    if not current_process['assessments'].empty:
        st.info("아래 표의 내용을 직접 수정할 수 있습니다.")
        edited_df = st.data_editor(
            current_process['assessments'],
            column_config={
                "가능성(빈도)": st.column_config.SelectboxColumn(
                    "가능성(빈도)", options=['매우자주(5)', '자주(4)', '보통(3)', '가끔(2)', '매우가끔(1)'], required=True
                ),
                "중대성(강도)": st.column_config.SelectboxColumn(
                    "중대성(강도)", options=['매우위험(4)', '위험(3)', '보통(2)', '양호(1)'], required=True
                ),
                "개선후 위험성": st.column_config.SelectboxColumn(
                    "개선후 위험성", options=['높음', '보통', '낮음'], required=True
                ),
                "개선 예정일": st.column_config.DateColumn("개선 예정일", format="YYYY-MM-DD"),
                "완료일": st.column_config.DateColumn("완료일", format="YYYY-MM-DD"),
            },
            use_container_width=True,
            num_rows="dynamic",
            key=f"data_editor_{app_data['current_process_index']}"
        )

        # 위험성 자동 계산
        def calculate_risk(row):
            try:
                freq = int(row['가능성(빈도)'].split('(')[1].replace(')', ''))
                sev = int(row['중대성(강도)'].split('(')[1].replace(')', ''))
                return freq * sev
            except (IndexError, ValueError):
                return 0
        
        edited_df['위험성'] = edited_df.apply(calculate_risk, axis=1)
        current_process['assessments'] = edited_df # 수정한 내용을 다시 세션 상태에 저장
        
    else:
        st.info("'평가표 생성/갱신' 버튼을 눌러 시작하세요.")


def render_all_tabs():
    """모든 UI 탭을 렌더링합니다."""
    tab_titles = ["1. 표지", "2. 작업공정", "3. 위험정보", "4. 유해위험요인분류", "5. 위험성평가표", "6. 위험감소대책", "7. 개선활동"]
    tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs(tab_titles)

    with tab1:
        render_tab_title()
    with tab2:
        render_tab_process()
    with tab3:
        render_tab_risk_info()
    with tab4:
        render_tab_classification()
    with tab5:
        render_tab_assessment()
    with tab6:
        st.header("위험성 감소 대책", divider='rainbow')
        st.info("위험성평가표에서 '감소 대책'을 입력하면 자동으로 요약됩니다.")
        for process in app_data['processes']:
            if 'assessments' in process and not process['assessments'].empty:
                st.subheader(f"공정: {process['name']}")
                reduction_data = process['assessments'][['유해 위험 요인', '위험성', '감소 대책', '개선 예정일', '담당자']]
                st.dataframe(reduction_data[reduction_data['위험성'] >= 9], use_container_width=True, hide_index=True) # 위험성 '높음' 이상만 표시

    with tab7:
        st.header("개선활동", divider='rainbow')
        st.info("이 섹션에서는 완료된 개선 사항과 개선 후 위험성을 추적합니다.")
        # 추후 st.data_editor를 사용하여 개선 후 결과 추적 기능 구현 가능

# --- 메인 앱 실행 ---
st.title("⚠️ 위험성평가 통합 시스템")
st.markdown("안전한 작업 환경을 만들기 위한 위험성평가 도구입니다. 각 탭을 순서대로 진행하세요.")

render_all_tabs()

# --- 사이드바 액션 ---
with st.sidebar:
    st.header("작업 도구")
    
    st.info("모든 탭의 내용을 입력한 후, 아래 버튼을 눌러 엑셀 보고서를 생성하세요.")
    
    if st.button("📊 엑셀 리포트 생성", use_container_width=True):
        sheets_to_export = {}
        
        # 시트 1: 사업장 정보
        info_data = {**app_data['company_info'], **app_data['workplace_info']}
        sheets_to_export['사업장정보'] = pd.DataFrame([info_data])
        
        # 시트 2: 공정 목록
        process_summary = [{"공정명": p['name'], "공정설명": p['description']} for p in app_data['processes']]
        sheets_to_export['공정목록'] = pd.DataFrame(process_summary)

        # 각 공정별 위험성평가표 시트
        for i, process in enumerate(app_data['processes']):
            if 'assessments' in process and not process['assessments'].empty:
                sheet_name = f"평가표_{i+1}_{process['name'][:20]}" # 시트 이름 길이 제한
                sheets_to_export[sheet_name] = process['assessments']

        excel_data = to_excel(sheets_to_export)
        
        st.download_button(
            label="✅ 엑셀 파일 다운로드",
            data=excel_data,
            file_name=f"위험성평가_결과서_{datetime.now().strftime('%Y%m%d')}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            use_container_width=True
        )