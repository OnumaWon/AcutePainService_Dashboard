
export enum Gender { Male = 'Male', Female = 'Female' }
export enum PatientType { Inpatient = 'Inpatient', Outpatient = 'Outpatient' }
export enum PayerType { SelfPay = 'SelfPay', Insurance = 'Insurance', Government = 'Government' }
export enum Nationality { Thai = 'Thai', Foreigner = 'Foreigner' }
export enum TraumaType { Trauma = 'Trauma', NonTrauma = 'NonTrauma' }
export enum PostOpPainMgmt {
    PCA = 'PCA',
    Epidural = 'Epidural',
    Oral = 'Oral',
    IV = 'IV',
    IV_Bolus = 'IV Bolus',
    IV_PCA = 'IV PCA',
    NerveBlock = 'Nerve Block',
    ManageBySurgeon = 'Managed by Surgeon',
    RequestAnesthesiologist = 'Request Anesthesiologist'
}
export enum Specialty { Ortho = 'Ortho', GenSurg = 'GenSurg', Uro = 'Uro', Gyn = 'Gyn' }
export enum OperationType {
    Major = 'Major',
    Minor = 'Minor',
    Emergency = 'Emergency',
    Elective = 'Elective',
    NonElective = 'Non-Elective',
    NonOperation = 'Non-Operation'
}
export enum OrthoType { TKA = 'TKA', THA = 'THA', Spine = 'Spine', Other = 'Other' }
export enum DrugGroup { Opioids = 'Opioids', NonOpioids = 'NonOpioids', Adjuvants = 'Adjuvants' }
export enum AdverseEventType {
    NauseaVomiting = 'Nausea/Vomiting',
    Sedation = 'Sedation',
    Pruritus = 'Pruritus',
    Dizziness = 'Dizziness',
    UrinaryRetention = 'Urinary Retention',
    Hypotension = 'Hypotension (Severe)',
    MotorBlock = 'Prolonged Motor Block',
    DuralPuncture = 'Dural Puncture',
    CatheterMigration = 'Catheter Migration',
    RespiratoryDepression = 'Resp. Depression',
    NerveInjury = 'Nerve Injury',
    LAST = 'LAST (Toxicity)',
    Anaphylaxis = 'Anaphylaxis',
    Infection = 'Infection',
    HematomaBleeding = 'Hematoma/Bleeding'
}

export interface PainScore {
    h0_24: number | null | undefined;
    h24_48: number | null | undefined;
    h48_72: number | null | undefined;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    isThinking?: boolean;
}

export interface QualityIndicators {
    freqRest24h: number | null;
    freqRest72h: number | null;
    freqMovement24h: number | null;
    freqMovement72h: number | null;
}

export interface PainInterference {
    generalActivity: number;
    mood: number;
    walkingAbility: number;
    normalWork: number;
    relations: number;
    sleep: number;
    enjoyment: number;
}

export interface CaseData {
    id: string;
    date: string;
    patientAge: number;
    patientGender: Gender;
    patientType: PatientType;
    payer: PayerType;
    nationality: Nationality;
    traumaType: TraumaType;
    postOpPainMgmt: PostOpPainMgmt;
    drugGroups: DrugGroup[];
    specificMedications: string[];
    specialty: Specialty;
    operationType: OperationType;
    orthoType: OrthoType;
    painScores: {
        rest: PainScore;
        movement: PainScore;
    };
    painScoreDischarge: number;
    painReductionRest50Percent: boolean;
    painReductionMove50Percent: boolean;
    complications: boolean;
    adverseEvents: AdverseEventType[];
    qualityIndicators: QualityIndicators;
    satisfactionScore: number;
    promsImprovement: number;
    painInterference: PainInterference;
    patientFeedback: string | null;
    drugGroupLabel?: string;
    opioidsText?: string;
    nonOpioidsText?: string;
    adjuvantsText?: string;
}
