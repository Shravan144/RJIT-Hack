export function getApiData(responseData) {
  if (responseData && typeof responseData === 'object' && responseData.data !== undefined) {
    return responseData.data;
  }
  return responseData;
}

export function getApiMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.error) {
    return data.error;
  }

  if (data?.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    const firstVal = firstKey ? data.errors[firstKey] : null;
    if (Array.isArray(firstVal) && firstVal.length > 0) {
      return String(firstVal[0]);
    }
    if (typeof firstVal === 'string') {
      return firstVal;
    }
  }

  return fallback;
}
