// GenInfoPage.js 상단에 추가
export const CATEGORY_OPTIONS = [
    {
        label: 'Planning (0000)',
        value: '0000',
        children: [
            { label: 'Motion planning (000000)', value: '000000' },
            { label: 'Grasp planning (000001)', value: '000001' },
            { label: 'Task planning (000010)', value: '000010' }
        ]
    },
    {
        label: 'Communication (0001)',
        value: '0001',
        children: [
            { label: 'To/From Server (000000)', value: '000000' },
            { label: 'To/From Other robot (000001)', value: '000001' },
            { label: 'To/From Inner modules of a robot (000010)', value: '000010' },
            { label: 'Clouds (000011)', value: '000011' }
        ]
    },
    {
        label: 'Interaction (0010)',
        value: '0010',
        children: [
            { label: 'Speech recognition (000000)', value: '000000' },
            { label: 'Speech generation (000001)', value: '000001' },
            { label: 'Gesture recognition (000010)', value: '000010' },
            { label: 'Structured dialog-based interaction (not speech-based) (000011)', value: '000011' }
        ]
    },
    {
        label: 'General Computing (0011)',
        value: '0011',
        children: [
            { label: 'Localization (000000)', value: '000000' },
            { label: 'Mapping (000001)', value: '000001' },
            { label: 'Feature detection (000010)', value: '000010' },
            { label: 'Generic data transformation (000011)', value: '000011' },
            { label: 'Learning (000100)', value: '000100' },
            { label: 'Control (000101)', value: '000101' }
        ]
    },
    {
        label: 'Orchestration/Management (0100)',
        value: '0100',
        children: [
            { label: 'Orchestration service (000000)', value: '000000' },
            { label: 'Monitoring service (000001)', value: '000001' }
        ]
    },
    {
        label: 'Sensing (0101)',
        value: '0101',
        children: [
            { label: 'Perception service (000000)', value: '000000' },
            { label: 'Recognition service (000001)', value: '000001' },
            { label: 'Measurement service (000010)', value: '000010' }
        ]
    },
    {
        label: 'Actuating (0110)',
        value: '0110',
        children: [
            { label: 'Electrical type (000100)', value: '000100' },
            { label: 'Hydraulic type (000001)', value: '000001' },
            { label: 'Pneumatic type (000010)', value: '000010' },
            { label: 'Hybrid (Elec + Hyd) (000101)', value: '000101' },
            { label: 'Hybrid (Elec + Pneu) (000110)', value: '000110' },
            { label: 'Hybrid (Pneu + Hyd) (000011)', value: '000011' },
            { label: 'Hybrid (Elec+Pneu + Hyd) (000111)', value: '000111' }
        ]
    },
    {
        label: 'Reserved (0111 - 1111)',
        value: '0111',
        children: [
            { label: 'reserved', value: 'reserved' }
        ]
    }
];

export function getCategoryLabel(l1, l2) {
    const first = CATEGORY_OPTIONS.find(opt => opt.value === l1);
    if (!first) return '';
    if (!l2) return first.label;
    const second = first.children?.find(opt => opt.value === l2);
    return second ? `${first.label} > ${second.label}` : first.label;
}

// 카테고리 value로 객체 반환 (예: moduleID 생성용)
export function getCategoryInfo(l1, l2, level0 = '10') {
    return {
        l1: l1 || '',
        l2: l2 || '',
        l3: '000000', // 3단계가 필요하면 확장
        level0: level0 // 입력기 타입에 따른 level0 ('10' = Software, '00' = Controller)
    };
}