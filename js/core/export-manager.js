export class ExportManager {
    constructor() {
        this.jsPDF = window.jspdf?.jsPDF;
    }
    
    async generateExcelReport(data) {
        try {
            const workbook = XLSX.utils.book_new();
            
            // 각 시트 생성
            const sheets = this.createExcelSheets(data);
            const sheetNames = ['표지', '작업공정', '위험정보', '유해위험요인분류', '위험성평가표', '위험감소대책', '개선활동'];
            
            sheets.forEach((sheet, index) => {
                XLSX.utils.book_append_sheet(workbook, sheet, sheetNames[index]);
            });
            
            // 파일 다운로드
            const fileName = `위험성평가_결과서_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            return true;
        } catch (error) {
            console.error('엑셀 생성 오류:', error);
            throw error;
        }
    }
    
    createExcelSheets(data) {
        const sheets = [];
        
        // 1. 표지
        sheets.push(this.createCoverSheet(data));
        
        // 2. 작업공정
        sheets.push(this.createProcessSheet(data));
        
        // 3. 위험정보
        sheets.push(this.createRiskInfoSheet(data));
        
        // 4. 유해위험요인분류
        sheets.push(this.createClassificationSheet(data));
        
        // 5. 위험성평가표
        sheets.push(this.createAssessmentSheet(data));
        
        // 6. 위험감소대책
        sheets.push(this.createReductionSheet(data));
        
        // 7. 개선활동
        sheets.push(this.createImprovementSheet(data));
        
        return sheets;
    }
    
    createCoverSheet(data) {
        const wsData = [
            ['위험성평가 결과서'],
            [''],
            ['사업장 정보'],
            ['회사명', data.company?.name || ''],
            ['주소', data.company?.address || ''],
            ['전화번호', data.company?.tel || ''],
            ['팩스번호', data.company?.fax || ''],
            [''],
            ['평가 정보'],
            ['대표자', data.workplace?.ceo || ''],
            ['주요생산품', data.workplace?.products || ''],
            ['근로자수', (data.workplace?.employees || '') + '명'],
            ['평가일자', data.workplace?.evalDate || ''],
            ['평가자', data.workplace?.evaluator || '']
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ width: 15 }, { width: 30 }];
        
        return ws;
    }
    
    createProcessSheet(data) {
        const wsData = [
            ['작업공정 분석'],
            [''],
            ['공정명', '공정설명', '주요기계기구', '유해위험물질']
        ];
        
        if (data.processes && Array.isArray(data.processes)) {
            data.processes.forEach(process => {
                wsData.push([
                    process.name || '',
                    process.description || '',
                    Array.isArray(process.equipment) ? process.equipment.join(', ') : '',
                    Array.isArray(process.chemicals) ? process.chemicals.join(', ') : ''
                ]);
            });
        }
        
        return XLSX.utils.aoa_to_sheet(wsData);
    }
    
    createRiskInfoSheet(data) {
        const wsData = [
            ['위험정보'],
            [''],
            ['공정명', '원재료', '기계기구', '화학물질']
        ];
        
        if (data.processes && Array.isArray(data.processes)) {
            data.processes.forEach(process => {
                const riskInfo = process.riskInfo || {};
                wsData.push([
                    process.name || '',
                    Array.isArray(riskInfo.materials) ? riskInfo.materials.join(', ') : '',
                    Array.isArray(riskInfo.equipment) ? riskInfo.equipment.join(', ') : '',
                    Array.isArray(riskInfo.chemicals) ? riskInfo.chemicals.join(', ') : ''
                ]);
            });
        }
        
        return XLSX.utils.aoa_to_sheet(wsData);
    }
    
    createClassificationSheet(data) {
        const wsData = [
            ['유해위험요인분류'],
            [''],
            ['공정명', '분류', '유해위험요인']
        ];
        
        if (data.processes && Array.isArray(data.processes)) {
            data.processes.forEach(process => {
                const classification = process.hazardClassification || {};
                Object.keys(classification).forEach(category => {
                    const hazards = classification[category];
                    if (Array.isArray(hazards)) {
                        hazards.forEach(hazard => {
                            wsData.push([
                                process.name || '',
                                this.getCategoryKoreanName(category),
                                hazard || ''
                            ]);
                        });
                    }
                });
            });
        }
        
        return XLSX.utils.aoa_to_sheet(wsData);
    }
    
    createAssessmentSheet(data) {
        const wsData = [
            ['위험성평가표'],
            [''],
            ['공정명', '작업내용', '분류', '원인', '유해위험요인', '법적근거', '현재상태및조치', '가능성', '중대성', '위험성', '감소대책', '개선후위험성', '개선예정일', '완료일', '담당자', '비고']
        ];
        
        if (data.processes && Array.isArray(data.processes)) {
            data.processes.forEach(process => {
                const assessments = process.assessments || [];
                if (Array.isArray(assessments)) {
                    assessments.forEach(assessment => {
                        wsData.push([
                            process.name || '',
                            assessment.workContent || '',
                            assessment.classification || '',
                            assessment.cause || '',
                            assessment.hazard || '',
                            Array.isArray(assessment.legalBasis) ? assessment.legalBasis.join('\n') : '',
                            assessment.currentState || '',
                            assessment.possibility || '',
                            assessment.severity || '',
                            assessment.risk || '',
                            assessment.measures || '',
                            assessment.improvedRisk || '',
                            assessment.improvementDate || '',
                            assessment.completionDate || '',
                            assessment.manager || '',
                            assessment.note || ''
                        ]);
                    });
                }
            });
        }
        
        return XLSX.utils.aoa_to_sheet(wsData);
    }
    
    createReductionSheet(data) {
        const wsData = [
            ['위험감소대책 및 실행계획서'],
            [''],
            ['재해형태', '감소대책', '조치결과', '일정', '확인일자', '비고']
        ];
        
        // 실제 데이터가 있다면 추가
        
        return XLSX.utils.aoa_to_sheet(wsData);
    }
    
    createImprovementSheet(data) {
        const wsData = [
            ['위험성평가 개선 안전보건활동 내용'],
            [''],
            ['유해위험요인', data.improvement?.hazards || ''],
            [''],
            ['현재 위험성'],
            ['가능성', '중대성', '위험성'],
            [data.improvement?.currentPossibility || '', data.improvement?.currentSeverity || '', data.improvement?.currentRisk || ''],
            [''],
            ['개선 후 위험성'],
            ['가능성', '중대성', '위험성'],
            [data.improvement?.improvedPossibility || '', data.improvement?.improvedSeverity || '', data.improvement?.improvedRisk || ''],
            [''],
            ['개선사항'],
            [data.improvement?.details || '']
        ];
        
        return XLSX.utils.aoa_to_sheet(wsData);
    }
    
    getCategoryKoreanName(category) {
        const names = {
            'mechanical': '기계(설비)적 요인',
            'electrical': '전기적 요인',
            'chemical': '화학(물질)적 요인',
            'biological': '생물학적 요인',
            'ergonomic': '작업특성 요인',
            'other': '작업환경 요인'
        };
        return names[category] || category;
    }
    
    async generatePDFReport(data) {
        if (!this.jsPDF) {
            throw new Error('jsPDF 라이브러리가 로드되지 않았습니다.');
        }
        
        const doc = new this.jsPDF('landscape', 'mm', 'a4');
        
        // PDF 내용 생성 (간단한 버전)
        doc.setFontSize(24);
        doc.text('위험성평가 보고서', 150, 30, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`작성일: ${new Date().toLocaleDateString('ko-KR')}`, 150, 50, { align: 'center' });
        
        // 파일 저장
        const fileName = `위험성평가_보고서_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return true;
    }
}