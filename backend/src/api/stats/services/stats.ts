/**
 * stats service
 */

'use strict';

module.exports = {
    async getStats() {
        try {
            const [totalBlogs, totalAuthors, totalUsers] = await Promise.all([
                strapi.db.query('api::blog.blog').count(),
                strapi.db.query('api::author.author').count(),
                strapi.db.query('plugin::users-permissions.user').count(),
            ]);

            return {
                totalPosts: totalBlogs,
                totalAuthors,
                totalUsers,
                totalComments: 0,
            };
        } catch (error) {
            throw new Error('Error fetching statistics');
        }
    },
};