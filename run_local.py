#!/usr/bin/env python3
"""
로컬 개발 환경에서 Streamlit 앱을 실행하는 스크립트
"""

import subprocess
import sys
import os

def main():
    """로컬에서 Streamlit 앱 실행"""
    
    # 현재 디렉토리 확인
    current_dir = os.getcwd()
    print(f"현재 디렉토리: {current_dir}")
    
    # 필요한 파일들 확인
    required_files = ['app.py', 'requirements.txt']
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ 누락된 파일: {', '.join(missing_files)}")
        return 1
    
    print("✅ 모든 필수 파일이 존재합니다.")
    
    # Streamlit 실행
    try:
        print("🚀 Streamlit 앱을 시작합니다...")
        print("📱 브라우저에서 http://localhost:8501 로 접속하세요.")
        print("⏹️  종료하려면 Ctrl+C를 누르세요.")
        print("-" * 50)
        
        subprocess.run([sys.executable, "-m", "streamlit", "run", "app.py"], check=True)
        
    except KeyboardInterrupt:
        print("\n👋 앱이 종료되었습니다.")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"❌ 오류 발생: {e}")
        return 1
    except FileNotFoundError:
        print("❌ Streamlit이 설치되지 않았습니다.")
        print("다음 명령어로 설치하세요: pip install streamlit")
        return 1

if __name__ == "__main__":
    sys.exit(main())

