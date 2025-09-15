const CACHE_EXPIRATION = 600; // seconds → 10 minutes

export const getCached = async (redisClient, key) => {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
};

export const setCached = async (
    redisClient,
    key,
    data,
    expiry = CACHE_EXPIRATION
) => {
    await redisClient.setex(key, expiry, JSON.stringify(data));
};

export const removeCacheByKey = async (redisClient, key) => {
    await redisClient.del(key);
};