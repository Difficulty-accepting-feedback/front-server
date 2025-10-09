import {STUDY_BASE_URL} from '@/lib/env'

export enum Category {
    STUDY = 'STUDY',
    HOBBY = 'HOBBY',
    MENTORING = 'MENTORING',
}

// 백엔드 enum과 키값 1:1 매칭
export enum PersonalityTag {
    DILIGENT = 'DILIGENT',
    ACTIVE = 'ACTIVE',
    CREATIVE = 'CREATIVE',
    COLLABORATIVE = 'COLLABORATIVE',
    PASSIONATE = 'PASSIONATE',
    METICULOUS = 'METICULOUS',
    HUMOROUS = 'HUMOROUS',
    PROGRESSIVE = 'PROGRESSIVE',
    PATIENT = 'PATIENT',
    OPTIMISTIC = 'OPTIMISTIC',
    ADVENTUROUS = 'ADVENTUROUS',
    EMPATHETIC = 'EMPATHETIC',
    DISCIPLINED = 'DISCIPLINED',
    INNOVATIVE = 'INNOVATIVE',
    RESILIENT = 'RESILIENT',
    CHARISMATIC = 'CHARISMATIC',
    MODEST = 'MODEST',
    ANALYTICAL = 'ANALYTICAL',
    ENTHUSIASTIC = 'ENTHUSIASTIC',
    SUPPORTIVE = 'SUPPORTIVE',
    VERSATILE = 'VERSATILE',
    CALM = 'CALM',
    INSPIRING = 'INSPIRING',
    LOYAL = 'LOYAL',
    VIBRANT = 'VIBRANT',
}

export enum SkillTag {
    // STUDY
    JAVA_PROGRAMMING = 'JAVA_PROGRAMMING',
    PYTHON_DATA_SCIENCE = 'PYTHON_DATA_SCIENCE',
    ENGLISH_CONVERSATION = 'ENGLISH_CONVERSATION',
    MATH_PROBLEM_SOLVING = 'MATH_PROBLEM_SOLVING',
    HISTORY_EXPLORATION = 'HISTORY_EXPLORATION',
    FRENCH_LANGUAGE = 'FRENCH_LANGUAGE',
    ECONOMICS = 'ECONOMICS',
    AI_MACHINE_LEARNING = 'AI_MACHINE_LEARNING',
    WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
    DATABASE_MANAGEMENT = 'DATABASE_MANAGEMENT',
    TOEIC = 'TOEIC',
    // HOBBY
    HIKING = 'HIKING',
    COOKING = 'COOKING',
    GUITAR_PLAYING = 'GUITAR_PLAYING',
    PHOTOGRAPHY = 'PHOTOGRAPHY',
    BOOK_READING = 'BOOK_READING',
    GARDENING = 'GARDENING',
    BOARD_GAMES = 'BOARD_GAMES',
    PAINTING = 'PAINTING',
    YOGA = 'YOGA',
    DANCING = 'DANCING',
    FISHING = 'FISHING',
    CYCLING = 'CYCLING',
    KNITTING = 'KNITTING',
    TRAVEL_PLANNING = 'TRAVEL_PLANNING',
    MOVIE_APPRECIATION = 'MOVIE_APPRECIATION',
    // MENTORING
    CAREER_COACHING = 'CAREER_COACHING',
    STARTUP_GUIDANCE = 'STARTUP_GUIDANCE',
    LEADERSHIP_COACHING = 'LEADERSHIP_COACHING',
    IT_JOB_PREPARATION = 'IT_JOB_PREPARATION',
    ART_MENTORING = 'ART_MENTORING',
    FINANCIAL_INVESTMENT = 'FINANCIAL_INVESTMENT',
    HEALTH_COACHING = 'HEALTH_COACHING',
    PUBLIC_SPEAKING = 'PUBLIC_SPEAKING',
    PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
    MARKETING_STRATEGY = 'MARKETING_STRATEGY',
    NEGOTIATION_SKILLS = 'NEGOTIATION_SKILLS',
    TIME_MANAGEMENT = 'TIME_MANAGEMENT',
    CREATIVE_WRITING = 'CREATIVE_WRITING',
    NETWORKING = 'NETWORKING',
    EMOTIONAL_INTELLIGENCE = 'EMOTIONAL_INTELLIGENCE',
    BACKEND_DEVELOPMENT = 'BACKEND_DEVELOPMENT',
    FRONTEND_DEVELOPMENT = 'FRONTEND_DEVELOPMENT',
    MOBILE_APP_DEVELOPMENT = 'MOBILE_APP_DEVELOPMENT',
    GRAPHIC_DESIGN = 'GRAPHIC_DESIGN',
    CONTENT_CREATION = 'CONTENT_CREATION',
}

// 화면 표기용 라벨 매핑
export const PersonalityTagLabel: Record<PersonalityTag, string> = {
    DILIGENT: '성실한',
    ACTIVE: '활발한',
    CREATIVE: '창의적인',
    COLLABORATIVE: '협력적인',
    PASSIONATE: '열정적인',
    METICULOUS: '꼼꼼한',
    HUMOROUS: '유머러스한',
    PROGRESSIVE: '진취적인',
    PATIENT: '인내심 있는',
    OPTIMISTIC: '낙관적인',
    ADVENTUROUS: '모험적인',
    EMPATHETIC: '공감하는',
    DISCIPLINED: '규율 있는',
    INNOVATIVE: '혁신적인',
    RESILIENT: '회복력 있는',
    CHARISMATIC: '카리스마 있는',
    MODEST: '겸손한',
    ANALYTICAL: '분석적인',
    ENTHUSIASTIC: '열광적인',
    SUPPORTIVE: '지지하는',
    VERSATILE: '다재다능한',
    CALM: '침착한',
    INSPIRING: '영감을 주는',
    LOYAL: '충성스러운',
    VIBRANT: '생기 넘치는',
};

export const SkillTagLabel: Record<SkillTag, string> = {
    JAVA_PROGRAMMING: '자바 프로그래밍',
    PYTHON_DATA_SCIENCE: '파이썬 데이터 사이언스',
    ENGLISH_CONVERSATION: '영어 회화',
    MATH_PROBLEM_SOLVING: '수학 문제 풀이',
    HISTORY_EXPLORATION: '역사 탐구',
    FRENCH_LANGUAGE: '프랑스어 학습',
    ECONOMICS: '경제',
    AI_MACHINE_LEARNING: 'AI/머신러닝',
    WEB_DEVELOPMENT: '웹 개발',
    DATABASE_MANAGEMENT: '데이터베이스 관리',
    TOEIC: '토익 자격증',
    HIKING: '등산',
    COOKING: '요리',
    GUITAR_PLAYING: '기타 연주',
    PHOTOGRAPHY: '사진 촬영',
    BOOK_READING: '독서',
    GARDENING: '원예',
    BOARD_GAMES: '보드게임',
    PAINTING: '회화',
    YOGA: '요가',
    DANCING: '댄스',
    FISHING: '낚시',
    CYCLING: '자전거 타기',
    KNITTING: '뜨개질',
    TRAVEL_PLANNING: '여행 계획',
    MOVIE_APPRECIATION: '영화 감상',
    CAREER_COACHING: '커리어 멘토링',
    STARTUP_GUIDANCE: '스타트업 창업 가이드',
    LEADERSHIP_COACHING: '리더십 코칭',
    IT_JOB_PREPARATION: 'IT 취업 준비',
    ART_MENTORING: '예술가 멘토링',
    FINANCIAL_INVESTMENT: '금융 투자 조언',
    HEALTH_COACHING: '건강 관리 코칭',
    PUBLIC_SPEAKING: '공개 연설',
    PROJECT_MANAGEMENT: '프로젝트 관리',
    MARKETING_STRATEGY: '마케팅 전략',
    NEGOTIATION_SKILLS: '협상 기술',
    TIME_MANAGEMENT: '시간 관리',
    CREATIVE_WRITING: '창의적 글쓰기',
    NETWORKING: '네트워킹',
    EMOTIONAL_INTELLIGENCE: '감성 지능',
    BACKEND_DEVELOPMENT: '백엔드 개발',
    FRONTEND_DEVELOPMENT: '프론트엔드 개발',
    MOBILE_APP_DEVELOPMENT: '모바일 앱 개발',
    GRAPHIC_DESIGN: '그래픽 디자인',
    CONTENT_CREATION: '콘텐츠 제작',
};

export interface GroupResponse {
    groupId: number;
    groupName: string;
    category: Category;
    description: string;
    amount: number;
    personalityTag: PersonalityTag;
    skillTag: SkillTag;
}

export interface GroupDetailResponse {
    groupId: number;
    groupName: string;
    category: Category;
    description: string;
    amount: number;
    viewCount: number;
    memberCount: number;
    personalityTag: PersonalityTag;
    skillTag: SkillTag;
}

interface RsData<T> {
    code: string;
    message: string;
    data: T;
}

export async function getGroups(category: Category): Promise<GroupResponse[]> {
    const res = await fetch(`${STUDY_BASE_URL}/api/v1/groups/STUDY`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'force-cache', // 캐싱 활성화로 반복 호출 방지
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('그룹 목록을 불러오는 데 실패했습니다.');
    }

    const rsData: RsData<GroupResponse[]> = await res.json();
    if (rsData.code !== '200') {
        throw new Error(rsData.message || 'API 응답 오류');
    }
    return rsData.data || [];
}

export async function getGroupDetail(groupId: number): Promise<GroupDetailResponse> {
    const res = await fetch(`${STUDY_BASE_URL}/api/v1/groups/STUDY/${groupId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store', // 상세 조회는 항상 최신 데이터 권장
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('그룹 상세 정보를 불러오는 데 실패했습니다.');
    }

    const rsData: RsData<GroupDetailResponse> = await res.json();
    if (rsData.code !== '200') {
        throw new Error(rsData.message || 'API 응답 오류');
    }

    return rsData.data;
}