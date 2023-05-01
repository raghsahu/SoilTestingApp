import { COLORS } from "../assets";
import { ReportByFarmItems } from "../database/Interfaces";
import { getTime } from "./CommonUtils";
import { GraphBarDataInterface, GraphGroupDataInterface, GraphSingleData } from "./Interfaces";

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
    const graphBarData= {
        allInOneGraph: {} as GraphBarDataInterface,
        allSeparateGraph: [] as GraphBarDataInterface[],
    } as GraphGroupDataInterface

   const tempGraphData = {
    graphHeader: 'Temperature Report',
    key: 'Temp',
    graphData: [] as GraphSingleData[],
   }
   const phGraphData = {
    graphHeader: 'PH Report',
    key: 'PH',
    graphData: [] as GraphSingleData[],
   }
   //cond report
   const ecGraphData = {
    graphHeader: 'EC Report',
    key: 'EC',
    graphData: [] as GraphSingleData[],
   }
   const nGraphData = {
    graphHeader: 'N Report',
    key: 'N',
    graphData: [] as GraphSingleData[],
   }
   const pGraphData = {
    graphHeader: 'P Report',
    key: 'P',
    graphData: [] as GraphSingleData[],
   }
   //POTASSIUM
   const kGraphData = {
    graphHeader: 'K Report',
    key: 'K',
    graphData: [] as GraphSingleData[],
   }
   //MOIS
   const humidityGraphData = {
    graphHeader: 'Humidity Report',
    key: 'Humidity',
    graphData: [] as GraphSingleData[],
   }

    allReportRes.map((item: ReportByFarmItems) => {
        if (item.temp) {
            const tempData = {
                value: parseInt(item.temp),
                label: getTime(item.create_time.toString()),
            }
            tempGraphData.graphData.push(tempData)
        } if (item.cond) {
            const tempData = {
                value: parseInt(item.cond),
                label: getTime(item.create_time.toString()),
            }
            ecGraphData.graphData.push(tempData)
        }
         if (item.ph) {
            const tempData = {
                value: parseInt(item.ph),
                label: getTime(item.create_time.toString()),
            }
            phGraphData.graphData.push(tempData)
        }
         if (item.nitrogen) {
            const tempData = {
                value: parseInt(item.nitrogen),
                label: getTime(item.create_time.toString()),
            }
            nGraphData.graphData.push(tempData)
        }
         if (item.phosphorus) {
            const tempData = {
                value: parseInt(item.phosphorus),
                label: getTime(item.create_time.toString()),
            }
            pGraphData.graphData.push(tempData)
        }
         if (item.potassium) {
            const tempData = {
                value: parseInt(item.potassium),
                label: getTime(item.create_time.toString()),
            }
            kGraphData.graphData.push(tempData)
        }
         if (item.mois) {
            const tempData = {
                value: parseInt(item.mois),
                label: getTime(item.create_time.toString()),
            }
            humidityGraphData.graphData.push(tempData)
        }
    });

    graphBarData.allSeparateGraph.push(tempGraphData)
    graphBarData.allSeparateGraph.push(ecGraphData)
    graphBarData.allSeparateGraph.push(phGraphData)
    graphBarData.allSeparateGraph.push(nGraphData)
    graphBarData.allSeparateGraph.push(kGraphData)
    graphBarData.allSeparateGraph.push(pGraphData)
    graphBarData.allSeparateGraph.push(humidityGraphData)

    const allInOneGraph = await convertAllInOneGraphData(graphBarData.allSeparateGraph);
    graphBarData.allInOneGraph = allInOneGraph;

    return graphBarData;
}

export const convertAllInOneGraphData = (graphAllBarData: GraphBarDataInterface[])=> {
    const averageGraphData = {
     graphHeader: '',
     key: '',
     graphData: [] as GraphSingleData[],
    } as GraphBarDataInterface;

    graphAllBarData.map((item: any)=> {
          if (item.key ==='Temp') {
            const sum = item.graphData.reduce(function(prev: any, current: any) {
                return prev  +current.value
              }, 0);
            const tempData = {
                value: sum/item.graphData?.length,
                label: item.key
            }
            averageGraphData.graphData.push(tempData)
        } if (item.key ==='EC') {
            const sum = item.graphData.reduce(function(prev: any, current: any) {
                return prev  +current.value
              }, 0);
            const tempData = {
                value: sum/item.graphData?.length,
                label: item.key
            }
            averageGraphData.graphData.push(tempData)
        }
         if (item.key ==='PH') {
            const sum = item.graphData.reduce(function(prev: any, current: any) {
                return prev  +current.value
              }, 0);
            const tempData = {
                value: sum/item.graphData?.length,
                label: item.key
            }
            averageGraphData.graphData.push(tempData)
        }
         if (item.key ==='N') {
            const sum = item.graphData.reduce(function(prev: any, current: any) {
                return prev  +current.value
              }, 0);
            const tempData = {
                value: sum/item.graphData?.length,
                label: item.key
            }
            averageGraphData.graphData.push(tempData)
        }
         if (item.key ==='P') {
            const sum = item.graphData.reduce(function(prev: any, current: any) {
                return prev  +current.value
              }, 0);
            const tempData = {
                value: sum/item.graphData?.length,
                label: item.key
            }
            averageGraphData.graphData.push(tempData)
        }
         if (item.key ==='K') {
            const sum = item.graphData.reduce(function(prev: any, current: any) {
                return prev  +current.value
              }, 0);
            const tempData = {
                value: sum/item.graphData?.length,
                label: item.key
            }
            averageGraphData.graphData.push(tempData)
        }
         if (item.key ==='Humidity') {
            const sum = item.graphData.reduce(function(prev: any, current: any) {
                return prev  +current.value
              }, 0);
            const tempData = {
                value: sum/item.graphData?.length,
                label: item.key
            }
            averageGraphData.graphData.push(tempData)
        }
    })
    return averageGraphData;
}

export const getSelectedGraphReportData = (item: ReportByFarmItems) => {
    const graphBarData= [] as GraphBarDataInterface[];

    const selectedGraphData = {
     graphHeader: `${item.farm_name} Report`,
     key: '',
     graphData: [] as GraphSingleData[]
    } as GraphBarDataInterface;

    if (item.temp) {
        const tempData = {
            value: parseInt(item.temp),
            label: 'Temp'
        }
        selectedGraphData.graphData.push(tempData)
    } if (item.cond) {
        const tempData = {
            value: parseInt(item.cond),
            label: 'EC'
        }
        selectedGraphData.graphData.push(tempData)
    }
     if (item.ph) {
        const tempData = {
            value: parseInt(item.ph),
            label: 'PH'
        }
        selectedGraphData.graphData.push(tempData)
    }
     if (item.nitrogen) {
        const tempData = {
            value: parseInt(item.nitrogen),
            label: 'N'
        }
        selectedGraphData.graphData.push(tempData)
    }
     if (item.phosphorus) {
        const tempData = {
            value: parseInt(item.phosphorus),
            label: 'P'
        }
        selectedGraphData.graphData.push(tempData)
    }
     if (item.potassium) {
        const tempData = {
            value: parseInt(item.potassium),
            label: 'K'
        }
        selectedGraphData.graphData.push(tempData)
    }
     if (item.mois) {
        const tempData = {
            value: parseInt(item.mois),
            label: 'H'
        }
        selectedGraphData.graphData.push(tempData)
    }

    graphBarData.push(selectedGraphData)
    return graphBarData;
}