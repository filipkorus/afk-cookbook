import config from '../../../config';

const paginationParams = ({page, limit}: {
	page?: string;
	limit?: string;
}) => {
	const {_page = config.APP.PAGINATION.DEFAULT_PAGE_MIN, _limit = config.APP.PAGINATION.DEFAULT_LIMIT_MAX} = {
		_page: Math.max(
			1,
			parseInt(page ?? '' + config.APP.PAGINATION.DEFAULT_PAGE_MIN)
		),
		_limit: Math.max(
			1,
			Math.min(parseInt(limit ?? '' + config.APP.PAGINATION.DEFAULT_LIMIT_MAX), config.APP.PAGINATION.MAX_LIMIT_MAX)
		)
	};
	const _startIndex = (_page - 1) * _limit;

	return {
		startIndex: _startIndex,
		page: _page,
		limit: _limit
	};
};

export default paginationParams;
