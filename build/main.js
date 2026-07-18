"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
const utils = __importStar(require("@iobroker/adapter-core"));
const goodWeUdp_js_1 = require("./lib/goodWeUdp.js");
const projectUtils_js_1 = require("./lib/projectUtils.js");
class Goodwe extends utils.Adapter {
    inverter = new goodWeUdp_js_1.GoodWeUdp(this);
    projectUtils = new projectUtils_js_1.ProjectUtils(this);
    tmrTimeout;
    cycleCnt = 0;
    constructor(options = {}) {
        super({ ...options, name: "goodwe-pv" });
        this.on("ready", this.onReady.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }
    async onReady() {
        void this.setState("info.connection", false, true);
        if (!this.config.pollCycle || this.config.pollCycle < 10 || this.config.pollCycle > 3600) {
            this.log.error(`Invalid pollCycle value: ${String(this.config.pollCycle)}. Must be between 10 and 3600 seconds. Adapter stopped.`);
            return;
        }
        this.inverter.Connect(this.config.ipAddr, 8899);
        this.myTimer();
        if (this.supportsFeature && this.supportsFeature("PLUGINS")) {
            const sentryInstance = this.getPluginInstance("sentry");
            const today = new Date();
            const last = await this.getStateAsync("info.lastSentryLogDay");
            if (last?.val != today.getDate()) {
                if (sentryInstance) {
                    const Sentry = sentryInstance.getSentryObject();
                    Sentry &&
                        Sentry.withScope((scope) => {
                            scope.setLevel("info");
                            scope.setTag("SentryDay", today.getDate());
                            scope.setTag("usedPollCycle", this.config.pollCycle);
                            Sentry.captureMessage("Adapter GoodWe-PV started", "info");
                        });
                }
                void this.setState("info.lastSentryLogDay", {
                    val: today.getDate(),
                    ack: true,
                });
            }
        }
    }
    onUnload(callback) {
        try {
            this.clearTimeout(this.tmrTimeout);
            callback();
        }
        catch {
            callback();
        }
    }
    async updateDeviceInfo() {
        this.inverter.ReadDeviceInfo();
        const di = this.inverter.DeviceInfo;
        await this.projectUtils.checkAndSetChannel(`DeviceInfo`, `DeviceInfo`, `goodwe-pv.png`);
        void this.projectUtils.checkAndSetValueNumber(`DeviceInfo.ModbusProtocolVersion`, di.ModbusProtocolVersion);
        void this.projectUtils.checkAndSetValueNumber(`DeviceInfo.RatedPower`, di.RatedPower, `Rated Power`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`DeviceInfo.AcOutputType`, di.AcOutputType);
        void this.projectUtils.checkAndSetValue(`DeviceInfo.SerialNumber`, di.SerialNumber, `Serial Number`);
        void this.projectUtils.checkAndSetValue(`DeviceInfo.DeviceType`, di.DeviceType, `Device Type`);
        void this.projectUtils.checkAndSetValueNumber(`DeviceInfo.DSP1_SW_Version`, di.DSP1_SoftwareVersion);
        void this.projectUtils.checkAndSetValueNumber(`DeviceInfo.DSP2_SW_Version`, di.DSP2_SoftwareVersion);
        void this.projectUtils.checkAndSetValueNumber(`DeviceInfo.DSP_SVN_Version`, di.DSP_SVN_Version);
        void this.projectUtils.checkAndSetValueNumber(`DeviceInfo.ARM_SW_Version`, di.ARM_SoftwareVersion);
        void this.projectUtils.checkAndSetValueNumber(`DeviceInfo.ARM_SVN_Version`, di.ARM_SVN_Version);
        void this.projectUtils.checkAndSetValue(`DeviceInfo.DSP_Int_FW_Version`, di.DSP_IntFirmwareVersion);
        void this.projectUtils.checkAndSetValue(`DeviceInfo.ARM_Int_FW_Version`, di.ARM_IntFirmwareVersion);
        void this.setState("info.connection", this.inverter.Status, true);
    }
    async updateRunningData() {
        this.inverter.ReadRunningData();
        const rd = this.inverter.RunningData;
        await this.projectUtils.checkAndSetChannel(`RunningData`, `RunningData`, `goodwe-pv.png`);
        await this.projectUtils.updateDcParameters(`RunningData`, `PV1`, rd.Pv1.Voltage, rd.Pv1.Current, rd.Pv1.Power, rd.Pv1.Mode);
        await this.projectUtils.updateDcParameters(`RunningData`, `PV2`, rd.Pv2.Voltage, rd.Pv2.Current, rd.Pv2.Power, rd.Pv2.Mode);
        await this.projectUtils.updateDcParameters(`RunningData`, `PV3`, rd.Pv3.Voltage, rd.Pv3.Current, rd.Pv3.Power, rd.Pv3.Mode);
        await this.projectUtils.updateDcParameters(`RunningData`, `PV4`, rd.Pv4.Voltage, rd.Pv4.Current, rd.Pv4.Power, rd.Pv4.Mode);
        await this.projectUtils.updateAcPhase(`RunningData`, `GridL1`, rd.GridL1.Voltage, rd.GridL1.Current, rd.GridL1.Frequency, rd.GridL1.Power);
        await this.projectUtils.updateAcPhase(`RunningData`, `GridL2`, rd.GridL2.Voltage, rd.GridL2.Current, rd.GridL2.Frequency, rd.GridL2.Power);
        await this.projectUtils.updateAcPhase(`RunningData`, `GridL3`, rd.GridL3.Voltage, rd.GridL3.Current, rd.GridL3.Frequency, rd.GridL3.Power);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.GridMode`, rd.GridMode, `Grid Mode`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.InverterTotalPower`, rd.InverterTotalPower, `Inverter Total Power`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.AcActivePower`, rd.AcActivePower, `AC Active Power`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.AcReactivePower`, rd.AcReactivePower, `AC Reactive Power`, `VAR`, `value.power.reactive`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.AcApparentPower`, rd.AcApparentPower, `AC Apparent Power`, `VA`, `value.power`);
        void this.projectUtils.updateAcPhaseBackup(`RunningData`, `BackUpL1`, rd.BackUpL1.Voltage, rd.BackUpL1.Current, rd.BackUpL1.Frequency, rd.BackUpL1.Power, rd.BackUpL1.Mode);
        void this.projectUtils.updateAcPhaseBackup(`RunningData`, `BackUpL2`, rd.BackUpL2.Voltage, rd.BackUpL2.Current, rd.BackUpL2.Frequency, rd.BackUpL2.Power, rd.BackUpL2.Mode);
        void this.projectUtils.updateAcPhaseBackup(`RunningData`, `BackUpL3`, rd.BackUpL3.Voltage, rd.BackUpL3.Current, rd.BackUpL3.Frequency, rd.BackUpL3.Power, rd.BackUpL3.Mode);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.PowerL1`, rd.PowerL1, `Power L1`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.PowerL2`, rd.PowerL2, `Power L2`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.PowerL3`, rd.PowerL3, `Power L3`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.TotalPowerBackUp`, rd.TotalPowerBackUp, `Total Power Backup`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.TotalPower`, rd.TotalPower, `Total Power`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.UpsLoadPercent`, rd.UpsLoadPercent, `UPS Load Percent`, `%`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.AirTemperature`, rd.AirTemperature, `Air Temperature`, `°C`, `value.temperature`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.ModulTemperature`, rd.ModulTemperature, `Module Temperature`, `°C`, `value.temperature`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.RadiatorTemperature`, rd.RadiatorTemperature, `Radiator Temperature`, `°C`, `value.temperature`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.FunctionBitValue`, rd.FunctionBitValue, `Function Bit Value`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.BusVoltage`, rd.BusVoltage, `Bus Voltage`, `V`, `value.voltage`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.NbusVoltage`, rd.NbusVoltage, `Nbus Voltage`, `V`, `value.voltage`);
        await this.projectUtils.updateDcParameters(`RunningData`, `Battery1`, rd.Battery1.Voltage, rd.Battery1.Current, rd.Battery1.Power, rd.Battery1.Mode);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.WarningCode`, rd.WarningCode, `Warning Code`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.SaftyCountry`, rd.SaftyCountry, `Safety Country`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.WorkMode`, rd.WorkMode, `Work Mode`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.OperationMode`, rd.OperationMode, `Operation Mode`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.ErrorMessage`, rd.ErrorMessage, `Error Message`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.PvEnergyTotal`, rd.PvEnergyTotal, `PV Energy Total`, `kWh`, `value.energy.produced`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.PvEnergyDay`, rd.PvEnergyDay, `PV Energy Day`, `kWh`, `value.energy.produced`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyTotal`, rd.EnergyTotal, `Energy Total`, `kWh`, `value.energy.produced`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.HoursTotal`, rd.HoursTotal, `Hours Total`, `h`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyDaySell`, rd.EnergyDaySell, `Energy Day Sell`, `kWh`, `value.energy.produced`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyTotalBuy`, rd.EnergyTotalBuy, `Energy Total Buy`, `kWh`, `value.energy.consumed`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyDayBuy`, rd.EnergyDayBuy, `Energy Day Buy`, `kWh`, `value.energy.consumed`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyTotalLoad`, rd.EnergyTotalLoad, `Energy Total Load`, `kWh`, `value.energy.consumed`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyDayLoad`, rd.EnergyDayLoad, `Energy Day Load`, `kWh`, `value.energy.consumed`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyBatteryCharge`, rd.EnergyBatteryCharge, `Energy Battery Charge`, `kWh`, `value.energy.consumed`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyDayCharge`, rd.EnergyDayCharge, `Energy Day Charge`, `kWh`, `value.energy.consumed`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyBatteryDischarge`, rd.EnergyBatteryDischarge, `Energy Battery Discharge`, `kWh`, `value.energy.produced`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.EnergyDayDischarge`, rd.EnergyDayDischarge, `Energy Day Discharge`, `kWh`, `value.energy.produced`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.BatteryStrings`, rd.BatteryStrings, `Battery Strings`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.CpldWarningCode`, rd.CpldWarningCode, `CPLD Warning Code`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.WChargeCtrFlag`, rd.WChargeCtrFlag, `W Charge Ctr Flag`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.DerateFlag`, rd.DerateFlag, `Derate Flag`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.DerateFrozenPower`, rd.DerateFrozenPower, `Derate Frozen Power`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.DiagStatusH`, rd.DiagStatusH, `Diag Status H`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.DiagStatusL`, rd.DiagStatusL, `Diag Status L`);
        void this.projectUtils.checkAndSetValueNumber(`RunningData.TotalPowerPv`, rd.TotalPowerPv, `Total Power PV`, `W`, `value.power`);
    }
    async updateExtComData() {
        this.inverter.ReadExtComData();
        const ec = this.inverter.ExtComData;
        await this.projectUtils.checkAndSetChannel(`ExtComData`, `ExtComData`, `goodwe-pv.png`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.Commode`, ec.Commode, `Communication Mode`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.Rssi`, ec.Rssi, `Signal Strength`, undefined, `value`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.ManufacturerCode`, ec.ManufacturerCode, `Manufacturer Code`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.MeterConnectStatus`, ec.MeterConnectStatus, `Meter Connect Status`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.MeterCommunicateStatus`, ec.MeterCommunicateStatus, `Meter Communicate Status`);
        await this.projectUtils.updateMeterPhase(`ExtComData`, `L1`, ec.L1.ActivePower, ec.L1.PowerFactor);
        await this.projectUtils.updateMeterPhase(`ExtComData`, `L2`, ec.L2.ActivePower, ec.L2.PowerFactor);
        await this.projectUtils.updateMeterPhase(`ExtComData`, `L3`, ec.L3.ActivePower, ec.L3.PowerFactor);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.TotalActivePower`, ec.TotalActivePower, `Total Active Power`, `W`, `value.power`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.TotalReactivePower`, ec.TotalReactivePower, `Total Reactive Power`, `VAR`, `value.power.reactive`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.PowerFactor`, ec.PowerFactor, `Power Factor`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.Frequency`, ec.Frequency, `Frequency`, `Hz`, `value.frequency`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.EnergyTotalSell`, ec.EnergyTotalSell, `Energy Total Sold`, `kWh`, `value.energy.produced`);
        void this.projectUtils.checkAndSetValueNumber(`ExtComData.EnergyTotalBuy`, ec.EnergyTotalBuy, `Energy Total Bought`, `kWh`, `value.energy.consumed`);
    }
    async updateBmsInfo() {
        this.inverter.ReadBmsInfo();
        const bms = this.inverter.BmsInfo;
        await this.projectUtils.checkAndSetChannel(`BMSInfo`, `BMSInfo`, `goodwe-pv.png`);
        void this.projectUtils.checkAndSetValueNumber(`BMSInfo.Status`, bms.Status, `Status`);
        void this.projectUtils.checkAndSetValueNumber(`BMSInfo.PackTemperature`, bms.PackTemperature, `Pack Temperature`, `°C`, `value.temperature`);
        void this.projectUtils.checkAndSetValueNumber(`BMSInfo.CurrentMaxCharge`, bms.CurrentMaxCharge, `Current Max Charge`, `A`, `value.current`);
        void this.projectUtils.checkAndSetValueNumber(`BMSInfo.CurrentMaxDischarge`, bms.CurrentMaxDischarge, `Current Max Discharge`, `A`, `value.current`);
        void this.projectUtils.checkAndSetValueNumber(`BMSInfo.ErrorCode`, bms.ErrorCode, `Error Code`);
        void this.projectUtils.checkAndSetValueNumber(`BMSInfo.SOC`, bms.SOC, `State of Charge`, `%`, `value.battery`);
        void this.projectUtils.checkAndSetValueNumber(`BMSInfo.SOH`, bms.SOH, `State of Health`, `%`);
        void this.projectUtils.checkAndSetValueNumber(`BMSInfo.BatteryStrings`, bms.BatteryStrings);
    }
    myTimer() {
        if (!this.inverter.Status) {
            this.cycleCnt = 0;
            this.inverter.ReadIdInfo();
        }
        else {
            switch (this.cycleCnt) {
                case 1:
                    void this.updateDeviceInfo();
                    break;
                case 3:
                    void this.updateRunningData();
                    break;
                case 5:
                    void this.updateExtComData();
                    break;
                case 7:
                    void this.updateBmsInfo();
                    break;
            }
            if (this.cycleCnt >= this.config.pollCycle) {
                this.cycleCnt = 0;
            }
            this.cycleCnt++;
        }
        this.tmrTimeout = this.setTimeout(() => this.myTimer(), 1000);
    }
}
if (require.main !== module) {
    module.exports = (options) => new Goodwe(options);
}
else {
    new Goodwe();
}
module.exports = Goodwe;
//# sourceMappingURL=main.js.map