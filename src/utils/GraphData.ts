import { COLORS } from "../assets";
import { ReportByFarmItems } from "../database/Interfaces";
import { getTime } from "./CommonUtils";

//sample data
export const barData = [
    {value: 250, label: 'M', frontColor: COLORS.brown_300},
    {value: 500, label: 'T', frontColor: COLORS.brown_500},
    {value: 745, label: 'W', frontColor: COLORS.brown_300},
    {value: 320, label: 'T', frontColor: COLORS.brown_300},
    {value: 600, label: 'F', frontColor: COLORS.brown_500},
    {value: 256, label: 'S', frontColor: COLORS.brown_300},
    {value: 300, label: 'S', frontColor: COLORS.brown_300},
];

export const getGraphReportData = async (allReportRes: ReportByFarmItems[])=> {
    const graphBarData= [] as any;

   const tempGraphData = {
    graphHeader: 'Temperature Report',
    graphData: [] as any
   }
   const phGraphData = {
    graphHeader: 'PH Report',
    graphData: [] as any
   }
   //cond report
   const ecGraphData = {
    graphHeader: 'EC Report',
    graphData: [] as any
   }
   const nGraphData = {
    graphHeader: 'N Report',
    graphData: [] as any
   }
   const pGraphData = {
    graphHeader: 'P Report',
    graphData: [] as any
   }
   //POTASSIUM
   const kGraphData = {
    graphHeader: 'K Report',
    graphData: [] as any
   }
   //MOIS
   const humidityGraphData = {
    graphHeader: 'Humidity Report',
    graphData: [] as any
   }
    allReportRes.map((item: ReportByFarmItems) => {
        if (item.temp) {
            const tempData = {
                value: parseInt(item.temp),
                label: getTime(item.create_time.toString())
            }
            tempGraphData.graphData.push(tempData)
        } if (item.cond) {
            const tempData = {
                value: parseInt(item.cond),
                label: getTime(item.create_time.toString())
            }
            ecGraphData.graphData.push(tempData)
        }
         if (item.ph) {
            const tempData = {
                value: parseInt(item.ph),
                label: getTime(item.create_time.toString())
            }
            phGraphData.graphData.push(tempData)
        }
         if (item.nitrogen) {
            const tempData = {
                value: parseInt(item.nitrogen),
                label: getTime(item.create_time.toString())
            }
            nGraphData.graphData.push(tempData)
        }
         if (item.phosphorus) {
            const tempData = {
                value: parseInt(item.phosphorus),
                label: getTime(item.create_time.toString())
            }
            pGraphData.graphData.push(tempData)
        }
         if (item.potassium) {
            const tempData = {
                value: parseInt(item.potassium),
                label: getTime(item.create_time.toString())
            }
            kGraphData.graphData.push(tempData)
        }
         if (item.mois) {
            const tempData = {
                value: parseInt(item.mois),
                label: getTime(item.create_time.toString())
            }
            humidityGraphData.graphData.push(tempData)
        }
    });

    graphBarData.push(tempGraphData)
    graphBarData.push(ecGraphData)
    graphBarData.push(phGraphData)
    graphBarData.push(nGraphData)
    graphBarData.push(kGraphData)
    graphBarData.push(pGraphData)
    graphBarData.push(humidityGraphData)

    return graphBarData;
}