import { GroupByFarmListDoc, GroupListDoc, ReportByFarm, SoilDbName } from "./DbConst"
import PouchDB from 'pouchdb-react-native';
import { CreateFarmsInterface, CreateFarmsItems, CreateGroupInterface, CreateGroupItems, ReportByFarmInterface, ReportByFarmItems } from "./Interfaces";
import { EventEmitter } from 'events';
import { endDateFormatToUTC } from "../utils/CommonUtils";

export const initializeSoilDb = () => {
  return new PouchDB(SoilDbName);
}

export const saveGroupData = async (db: any, newItem: CreateGroupItems) => {
  // Try to retrieve the document by ID
  return db.get(GroupListDoc).then(async (doc: any) => {
    // Document found
    console.log('Document found:');
    if (doc.items) {
      console.log('Document already exists');
      const newId = doc.items.length + 1;
      doc.items.push({
        ...newItem,
        group_id: newId,
      });
      // Save the modified document back to the database
      return await db.put(doc);
    }
  }).catch(async (err: any) => {
    console.log("Document doesn't exist, create it");
    // Document doesn't exist, create it
    if (err.status === 404) {
      const newDoc: CreateGroupInterface = {
        _id: GroupListDoc,
        items: [{
          ...newItem,
          group_id: 1,
        }],
      };
      return await db.put(newDoc);
    } else {
      console.log('Error checking if document exists:', err);
    }
  })
}

export const fetchAllGroupData = async (db: any) => {
  const groupRes = await db.get(GroupListDoc);
  if (groupRes?.items) {
    return groupRes?.items as CreateGroupItems[];
  }
  return [] as CreateGroupItems[];
}

export const updateGroupData = async (db: any, newItem: CreateGroupItems, isSelectedGroup: CreateGroupItems) => {
  // Get the document by its ID
  const doc = await db.get(GroupListDoc);
  // Find the index of the item you want to update
  const itemIndex = doc.items.findIndex((item: CreateGroupItems) => item.group_id === isSelectedGroup.group_id);
  // Update the item with the new data
  doc.items[itemIndex] = {
    ...isSelectedGroup,
    ...newItem
  }
  // Save the updated document
  return await db.put(doc);
}

export const deleteGroupData = async (db: any, isSelectedGroup: CreateGroupItems) => {
  // Get the document by its ID
  const doc = await db.get(GroupListDoc);
  // Find the index of the item you want to update
  const itemIndex = doc.items.findIndex((item: CreateGroupItems) => item.group_id === isSelectedGroup.group_id);
  // If the item exists, remove it from the array and save the updated document
  if (itemIndex >= 0) {
    doc.items.splice(itemIndex, 1);
    return await db.put(doc);
  } else {
    console.log(`Item with id 'item2' not found in document '${GroupListDoc}'.`);
  }
}

export const saveFarmData = async (db: any, newItem: CreateFarmsItems) => {
  // Try to retrieve the document by ID
  return db.get(GroupByFarmListDoc).then(async (doc: any) => {
    // Document found
    console.log('Document found:');
    if (doc.items) {
      console.log('Document already exists');
      const newId = doc.items.length + 1;
      doc.items.push({
        ...newItem,
        farm_id: newId,
      });
      // Save the modified document back to the database
      return await db.put(doc);
    }
  }).catch(async (err: any) => {
    console.log("Document doesn't exist, create it");
    // Document doesn't exist, create it
    if (err.status === 404) {
      const newDoc: CreateFarmsInterface = {
        _id: GroupByFarmListDoc,
        items: [{
          ...newItem,
          farm_id: 1,
        }],
      };
      return await db.put(newDoc);
    } else {
      console.log('Error checking if document exists:', err);
    }
  })
}

export const updateFarmData = async (db: any, newItem: CreateFarmsItems, isSelectedFarmItem: CreateFarmsItems) => {
  // Try to retrieve the document by ID
  const doc = await db.get(GroupByFarmListDoc);
  const itemIndex = doc.items.findIndex((item: CreateFarmsItems) => item.farm_id === isSelectedFarmItem.farm_id);
  // Update the item with the new data
  doc.items[itemIndex] = {
    ...isSelectedFarmItem,
    ...newItem
  }
  // Save the updated document
  return await db.put(doc);
}

export const deleteFarmData = async (db: any, isSelectedGroup: CreateFarmsItems) => {
  // Get the document by its ID
  const doc = await db.get(GroupByFarmListDoc);
  // Find the index of the item you want to update
  const itemIndex = doc.items.findIndex((item: CreateFarmsItems) => item.farm_id === isSelectedGroup.farm_id);
  // If the item exists, remove it from the array and save the updated document
  if (itemIndex >= 0) {
    doc.items.splice(itemIndex, 1);
    return await db.put(doc);
  } else {
    console.log(`Item with id 'item2' not found in document '${GroupListDoc}'.`);
  }
}

export const fetchAllGroupByFarmList = async (db: any, groupId: number) => {
  const groupRes = await db.get(GroupByFarmListDoc);
  if (groupRes?.items?.length) {
    const filteredData = groupRes.items.filter((item: CreateFarmsItems) =>
      item.group_id === groupId
    );
    return filteredData;
  }
}

export const saveReportByFarm = async (db: any, newItem: ReportByFarmItems) => {
  // Try to retrieve the document by ID
  return db.get(ReportByFarm).then(async (doc: any) => {
    // Document found
    console.log('Document found:', doc);
    if (doc.items) {
      console.log('Document already exists');
      const newId = doc.items.length + 1;
      doc.items.push({
        ...newItem,
        report_id: newId,
      });
      // Save the modified document back to the database
      return await db.put(doc);
    }
  }).catch(async (err: any) => {
    console.log("Document doesn't exist, create it");
    // Document doesn't exist, create it
    if (err.status === 404) {
      const newDoc: ReportByFarmInterface = {
        _id: ReportByFarm,
        items: [{
          ...newItem,
          report_id: 1,
        }],
      };
      return await db.put(newDoc);
    } else {
      console.log('Error checking if document exists:', err);
    }
  })
}

export const fetchAllReportDataByFarm = async (db: any, groupId: number, farm_id: number, toDate: string, fromDate?: string) => {
  const reportRes = await db.get(ReportByFarm)
  .catch((err: any)=> {
    console.log('rrrErr ', err)
  });
  if (reportRes?.items?.length) {
    const to_Date = new Date(toDate);
    const from_Date = fromDate ? new Date(fromDate) : new Date(endDateFormatToUTC((new Date()).toString()));

    const filteredData = reportRes.items.filter((item: ReportByFarmItems) => {
      if (toDate.length && fromDate?.length) {
        if (item.group_id === groupId &&
          item.farm_id === farm_id &&
          (new Date(item.create_time) >= to_Date || new Date(item.create_time) === to_Date)
          &&
          (new Date(item.create_time) <= from_Date || new Date(item.create_time) === from_Date)
        ) {
          return item
        }
      } else if (toDate.length && !fromDate?.length) {
        if (item.group_id === groupId &&
          item.farm_id === farm_id &&
          new Date(item.create_time).getDate() === to_Date.getDate()
        ) {
          return item
        }
      }
    }
    );
    return filteredData || [] as ReportByFarmItems[];
  }else{
    return [] as ReportByFarmItems[];
  }
}

export const fetchAllReportDataByGroup = async (db: any, groupId: number, toDate: string, fromDate?: string) => {
  const reportRes = await db.get(ReportByFarm)
  .catch((err: any)=> {
    console.log('rrrErr ', err)
  });
  if (reportRes?.items?.length) {
    const to_Date = new Date(toDate);
    const from_Date = fromDate ? new Date(fromDate) : new Date(endDateFormatToUTC((new Date()).toString()));

    const filteredData = reportRes.items.filter((item: ReportByFarmItems) => {
      if (toDate.length && fromDate?.length) {
        if (item.group_id === groupId &&
          (new Date(item.create_time) >= to_Date || new Date(item.create_time) === to_Date)
          &&
          (new Date(item.create_time) <= from_Date || new Date(item.create_time) === from_Date)
        ) {
          return item
        }
      } else if (toDate.length && !fromDate?.length) {
        if (item.group_id === groupId &&
          new Date(item.create_time).getDate() === to_Date.getDate()
        ) {
          return item
        }
      }
    }
    );
    return filteredData || [] as ReportByFarmItems[];
  }else{
    return [] as ReportByFarmItems[];
  }
}

export const fetchAllReportDataByDate = async (db: any, toDate: string, fromDate?: string) => {
  const reportRes = await db.get(ReportByFarm)
  .catch((err: any)=> {
    console.log('rrrErr ', err)
  });

  if (reportRes?.items?.length) {
    const to_Date = new Date(toDate);
    const from_Date = fromDate ? new Date(fromDate) : new Date(endDateFormatToUTC((new Date()).toString()));

    const filteredData = reportRes.items.filter((item: ReportByFarmItems) => {
      if (toDate.length && fromDate?.length) {
        if ((new Date(item.create_time) >= to_Date || new Date(item.create_time) === to_Date)
          &&
          (new Date(item.create_time) <= from_Date || new Date(item.create_time) === from_Date)
        ) {
          return item
        }
      }
      else if (toDate.length && !fromDate?.length) {
        if (new Date(item.create_time).getDate() === to_Date.getDate()
          // &&
          // new Date(item.create_time) <= from_Date
        ) {
          return item
        }
      }
    });
    return filteredData || [] as ReportByFarmItems[];
  }else{
    return [] as ReportByFarmItems[];
  }
}

export const fetchSamplesCountByFarm = async (db: any, groupId: number, farm_id: number) => {
  const reportRes = await db.get(ReportByFarm)
  .catch((err: any)=> {
    console.log('rrrErr ', err)
  });;
  if (reportRes?.items?.length) {
    const filteredData = reportRes.items.filter((item: ReportByFarmItems) => {
      if (item.group_id === groupId &&
        item.farm_id === farm_id
      ) {
        return item
      }
    }
    );
    return filteredData?.length || 0;
  }else{
    return 0;
  }
}