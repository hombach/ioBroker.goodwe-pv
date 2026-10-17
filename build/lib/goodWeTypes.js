"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodWeBmsWarningBits = exports.GoodWeBmsErrorBits = exports.GoodWeDiagStatusBits = exports.GoodWeWorkModes = exports.GoodWeBatteryModes = exports.GoodweBmsInfo = exports.GoodWeExternalComData = exports.GoodWeMeterPhase = exports.GoodWeRunningData = exports.AcPhaseBackup = exports.AcPhase = exports.DcParameters = exports.GoodWeDeviceInfo = exports.GoodWeIdInfo = exports.GoodWeRegister = exports.GoodWePacket = void 0;
exports.getBatteryModeText = getBatteryModeText;
exports.getWorkModeText = getWorkModeText;
class GoodWePacket {
    static Format = { Packet: 7, Checksum: 2 };
    static Header = { High: 0xaa, Low: 0x55 };
    static Addr = { AP: 0xc0, Inverter: 0x7f };
    static CtrCode = { Register: 0x00, Read: 0x01, Execute: 0x03 };
    static FcCodeRegister = {
        Offline: 0x00,
        RegisterRequest: 0x80,
        AllocateRegisterAddr: 0x01,
        AddressConfirm: 0x81,
        RemoveRegister: 0x02,
        RemoveConfirm: 0x82,
    };
    static FcCodeRead = {
        QueryRunningInfo: 0x01,
        ResponseRunningInfo: 0x81,
        QueryIdInfo: 0x02,
        ResponseIdInfo: 0x82,
        QuerySettingInfo: 0x03,
        ResponseSettingInfo: 0x83,
    };
}
exports.GoodWePacket = GoodWePacket;
class GoodWeRegister {
    static Format = { Frame: 5, CRC16: 2 };
    static RecvHeader = { High: 0xaa, Low: 0x55 };
    static Addr = { Inverter: 0xf7 };
    static FcDode = { Read: 0x03, ReadSingleRegister: 0x06, WriteMultipleRegister: 0x09 };
}
exports.GoodWeRegister = GoodWeRegister;
class GoodWeIdInfo {
    FirmwareVersion = "";
    ModelName = "";
    Na = new Uint8Array(16);
    SerialNumber = "";
    NomVpv = 0.0;
    InternalVersion = "";
    SafetyCountryCode = 0x00;
}
exports.GoodWeIdInfo = GoodWeIdInfo;
class GoodWeDeviceInfo {
    ModbusProtocolVersion = 0;
    RatedPower = 0;
    AcOutputType = 0;
    SerialNumber = "";
    DeviceType = "";
    DSP1_SoftwareVersion = 0;
    DSP2_SoftwareVersion = 0;
    DSP_SVN_Version = 0;
    ARM_SoftwareVersion = 0;
    ARM_SVN_Version = 0;
    DSP_IntFirmwareVersion = "";
    ARM_IntFirmwareVersion = "";
}
exports.GoodWeDeviceInfo = GoodWeDeviceInfo;
class DcParameters {
    Voltage = 0.0;
    Current = 0.0;
    Power = 0.0;
    Mode = 0;
}
exports.DcParameters = DcParameters;
class AcPhase {
    Voltage = 0.0;
    Current = 0.0;
    Frequency = 0.0;
    Power = 0.0;
}
exports.AcPhase = AcPhase;
class AcPhaseBackup {
    Voltage = 0.0;
    Current = 0.0;
    Frequency = 0.0;
    Power = 0.0;
    Mode = 0;
}
exports.AcPhaseBackup = AcPhaseBackup;
class GoodWeRunningData {
    Pv1 = new DcParameters();
    Pv2 = new DcParameters();
    Pv3 = new DcParameters();
    Pv4 = new DcParameters();
    GridL1 = new AcPhase();
    GridL2 = new AcPhase();
    GridL3 = new AcPhase();
    GridMode = 0;
    InverterTotalPower = 0;
    AcActivePower = 0;
    AcReactivePower = 0;
    AcApparentPower = 0;
    BackUpL1 = new AcPhaseBackup();
    BackUpL2 = new AcPhaseBackup();
    BackUpL3 = new AcPhaseBackup();
    PowerL1 = 0;
    PowerL2 = 0;
    PowerL3 = 0;
    TotalPowerBackUp = 0;
    TotalPower = 0;
    UpsLoadPercent = 0;
    AirTemperature = 0.0;
    ModulTemperature = 0.0;
    RadiatorTemperature = 0.0;
    FunctionBitValue = 0;
    BusVoltage = 0.0;
    NbusVoltage = 0.0;
    Battery1 = new DcParameters();
    WarningCode = 0;
    SaftyCountry = 0;
    WorkMode = 0;
    OperationMode = 0;
    ErrorMessage = 0;
    PvEnergyTotal = 0.0;
    PvEnergyDay = 0.0;
    EnergyTotal = 0.0;
    HoursTotal = 0.0;
    EnergyDaySell = 0.0;
    EnergyTotalBuy = 0.0;
    EnergyDayBuy = 0.0;
    EnergyTotalLoad = 0.0;
    EnergyDayLoad = 0.0;
    EnergyBatteryCharge = 0.0;
    EnergyDayCharge = 0.0;
    EnergyBatteryDischarge = 0.0;
    EnergyDayDischarge = 0.0;
    BatteryStrings = 0;
    CpldWarningCode = 0;
    WChargeCtrFlag = 0;
    DerateFlag = 0;
    DerateFrozenPower = 0;
    DiagStatusH = 0;
    DiagStatusL = 0;
    TotalPowerPv = 0;
}
exports.GoodWeRunningData = GoodWeRunningData;
class GoodWeMeterPhase {
    ActivePower = 0;
    PowerFactor = 0.0;
}
exports.GoodWeMeterPhase = GoodWeMeterPhase;
class GoodWeExternalComData {
    Commode = 0;
    Rssi = 0;
    ManufacturerCode = 0;
    MeterConnectStatus = 0;
    MeterCommunicateStatus = 0;
    L1 = new GoodWeMeterPhase();
    L2 = new GoodWeMeterPhase();
    L3 = new GoodWeMeterPhase();
    TotalActivePower = 0;
    TotalReactivePower = 0;
    PowerFactor = 0.0;
    Frequency = 0.0;
    EnergyTotalSell = 0.0;
    EnergyTotalBuy = 0.0;
}
exports.GoodWeExternalComData = GoodWeExternalComData;
class GoodweBmsInfo {
    Status = 0;
    PackTemperature = 0.0;
    CurrentMaxCharge = 0;
    CurrentMaxDischarge = 0;
    ErrorCode = 0;
    SOC = 0;
    SOH = 0;
    BatteryStrings = 0;
    WarningCode = 0;
    Protocol = 0;
    ErrorCodeH = 0;
    WarningCodeH = 0;
    SoftwareVersion = 0;
}
exports.GoodweBmsInfo = GoodweBmsInfo;
exports.GoodWeBatteryModes = {
    0: "No battery",
    1: "Standby",
    2: "Discharge",
    3: "Charge",
    4: "To be charged",
    5: "To be discharged",
};
function getBatteryModeText(mode) {
    return exports.GoodWeBatteryModes[mode] ?? `${mode}`;
}
exports.GoodWeWorkModes = {
    0: "Wait Mode",
    1: "Normal (On-Grid)",
    2: "Normal (Off-Grid)",
    3: "Fault Mode",
    4: "Flash Mode",
    5: "Check Mode",
};
function getWorkModeText(mode) {
    return exports.GoodWeWorkModes[mode] ?? `${mode}`;
}
exports.GoodWeDiagStatusBits = {
    0: "BatteryVoltageLow",
    1: "BatterySocLow",
    2: "BatterySocInBack",
    3: "BmsDischargeDisabled",
    4: "DischargeTimeOn",
    5: "ChargeTimeOn",
    6: "DischargeDriverOn",
    7: "BmsDischargeCurrentLow",
    8: "AppDischargeCurrentTooLow",
    9: "MeterCommunicationFailure",
    10: "MeterConnectionReversed",
    11: "SelfUseLoadLight",
    12: "EmsDischargeCurrentZero",
    13: "DischargeBusHighPvVoltage",
    14: "BatteryDisconnected",
    15: "BatteryOvercharged",
    16: "BmsTemperatureTooHigh",
    17: "BmsChargeTooHigh",
    18: "BmsChargeDisabled",
    19: "SelfUseOff",
    20: "SocDeltaTooVolatile",
    21: "BatterySelfDischargeTooHigh",
    22: "BatterySocLowOffGrid",
    23: "GridWaveUnstable",
    24: "ExportPowerLimitSet",
    25: "PfValueSet",
    26: "RealPowerLimitSet",
    27: "DcOutputOn",
    28: "SocProtectOff",
    30: "BmsEmergencyCharging",
};
exports.GoodWeBmsErrorBits = {
    0: "ChargingOverVoltage2",
    1: "DischargingUnderVoltage2",
    2: "CellTemperatureHigh2",
    3: "CellTemperatureLow2",
    4: "ChargingOverCurrent2",
    5: "DischargingOverCurrent2",
    6: "PrechargeFault",
    7: "DcBusFault",
    8: "BatteryBreak",
    9: "BatteryLock",
    10: "DischargingCircuitFailure",
    11: "ChargingCircuitFailure",
    12: "CommunicationFailure2",
    13: "CellTemperatureHigh3",
    14: "DischargingUnderVoltage3",
    15: "ChargingOverVoltage3",
};
exports.GoodWeBmsWarningBits = {
    0: "ChargingOverVoltage1",
    1: "DischargingUnderVoltage1",
    2: "CellTemperatureHigh1",
    3: "CellTemperatureLow1",
    4: "ChargingOverCurrent1",
    5: "DischargingOverCurrent1",
    6: "CommunicationFailure1",
    7: "SystemReboot",
    8: "CellImbalance",
    9: "SystemTemperatureLow1",
    10: "SystemTemperatureLow2",
    11: "SystemTemperatureHigh",
};
//# sourceMappingURL=goodWeTypes.js.map