import _ from 'lodash/fp';

const pickDeepAll = _.curry((props, obj) => {
	const propList = _.concat([], props);
	const [propStrings, propObjs] = _.partition(_.isString, propList);

	const picked1 = _.pickAll(propStrings, obj);
	const picked2 = _.reduce((pickedObj, propMap) => {
		const mappedObj = _.mapValues(_.get(_, obj), propMap);

		return Object.assign(pickedObj, mappedObj);
	}, {}, propObjs);

	return Object.assign(picked1, picked2);
});

export {
	pickDeepAll,
};