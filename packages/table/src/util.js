import { getValueByPath } from 'element-ui/src/utils/util';

export const getCell = function(event) {
  let cell = event.target;

  while (cell && cell.tagName.toUpperCase() !== 'HTML') {
    if (cell.tagName.toUpperCase() === 'TD') {
      return cell;
    }
    cell = cell.parentNode;
  }

  return null;
};

const isObject = function(obj) {
  return obj !== null && typeof obj === 'object';
};

export const orderBy = function(array, sortKey, reverse, sortMethod, sortBy) {
  if (!sortKey && !sortMethod && (!sortBy || Array.isArray(sortBy) && !sortBy.length)) {
    return array;
  }
  if (typeof reverse === 'string') {
    reverse = reverse === 'descending' ? -1 : 1;
  } else {
    reverse = (reverse && reverse < 0) ? -1 : 1;
  }
  const getKey = sortMethod ? null : function(value, index) {
    if (sortBy) {
      if (!Array.isArray(sortBy)) {
        sortBy = [sortBy];
      }
      return sortBy.map(function(by) {
        if (typeof by === 'string') {
          return getValueByPath(value, by);
        } else {
          return by(value, index, array);
        }
      });
    }
    if (sortKey !== '$key') {
      if (isObject(value) && '$value' in value) value = value.$value;
    }
    return [isObject(value) ? getValueByPath(value, sortKey) : value];
  };
  const compare = function(a, b) {
    if (sortMethod) {
      return sortMethod(a.value, b.value);
    }
    for (let i = 0, len = a.key.length; i < len; i++) {
      let valueA = a.key[i];
      let valueB = b.key[i];
      if (typeof valueA === 'string') {
        valueA = valueA.trim();
      }
      if (typeof valueB === 'string') {
        valueB = valueB.trim();
      }
      if (valueA === undefined || valueA === '') {
        valueA = null;
      }
      if (valueB === undefined || valueB === '') {
        valueB = null;
      }
      if (valueA === null || valueB === null) {
        if (valueA === valueB) {
          continue;
        }
        if (valueA === null) {
          return 1;
        } else {
          return -1;
        }
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const flag = valueA.localeCompare(valueB);
        if (flag === 0) {
          continue;
        }
        return flag;
      } else {
        if (valueA < valueB) {
          return -1;
        }
        if (valueA > valueB) {
          return 1;
        }
      }
    }
    return 0;
  };
  return array.map(function(value, index) {
    return {
      value: value,
      index: index,
      key: getKey ? getKey(value, index) : null
    };
  }).sort(function(a, b) {
    let order = compare(a, b);
    if (!order) {
      // make stable https://en.wikipedia.org/wiki/Sorting_algorithm#Stability
      order = a.index - b.index;
    }
    return order * reverse;
  }).map(item => item.value);
};

export const getColumnById = function(table, columnId) {
  let column = null;
  table.columns.forEach(function(item) {
    if (item.id === columnId) {
      column = item;
    }
  });
  return column;
};

export const getColumnByKey = function(table, columnKey) {
  let column = null;
  for (let i = 0; i < table.columns.length; i++) {
    const item = table.columns[i];
    if (item.columnKey === columnKey) {
      column = item;
      break;
    }
  }
  return column;
};

export const getColumnByCell = function(table, cell) {
  const matches = (cell.className || '').match(/el-table_[^\s]+/gm);
  if (matches) {
    return getColumnById(table, matches[0]);
  }
  return null;
};

export const getRowIdentity = (row, rowKey) => {
  if (!row) throw new Error('row is required when get row identity');
  if (typeof rowKey === 'string') {
    if (rowKey.indexOf('.') < 0) {
      return row[rowKey];
    }
    let key = rowKey.split('.');
    let current = row;
    for (let i = 0; i < key.length; i++) {
      current = current[key[i]];
    }
    return current;
  } else if (typeof rowKey === 'function') {
    return rowKey.call(null, row);
  }
};

export const isSameTableData = (data1, data2) => {
  if (data1 === null || data2 === null) {
    if (data1 === data2) {
      return true;
    }
    return false;
  }

  if (data1.length !== data2.length) {
    return false;
  }

  data1 = data1.map(d => d._dataId);
  data1.sort();
  data1 = data1.join(',');
  data2 = data2.map(d => d._dataId);
  data2.sort();
  data2 = data2.join(',');
  return data1 === data2;
};

export const isSameColumns = (columns1, columns2) => {
  if (columns1 === null && columns2 === null) {
    return true;
  }

  if (columns1 === null || columns2 === null) {
    return false;
  }

  if (columns1.length !== columns2.length) {
    return false;
  }

  const len = columns1.length;
  for (let i = 0; i < len; i++) {
    if (columns1[i] !== columns2[i]) {
      return false;
    }
  }
  return true;
};
