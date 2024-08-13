import { lazy } from 'react';

// Pages
const Info = lazy(() => import('@pages/LabDip/Info'));
const InfoEntry = lazy(() => import('@pages/LabDip/Info/Entry'));

const Recipe = lazy(() => import('@pages/LabDip/Recipe'));
const RecipeEntry = lazy(() => import('@pages/LabDip/Recipe/Entry'));
const RecipeDetails = lazy(() => import('@pages/LabDip/Recipe/ByRecipeId'));

export const LabDipRoutes = [
	{
		id: 1,
		name: 'Info',
		path: '/lab-dip/info',
		element: Info,
		type: 'lab_dip',
		page_name: 'lab_dip__info',
		actions: ['create', 'read', 'update', 'delete'],
	},
	{
		id: 15,
		name: 'Info Entry',
		path: '/lab-dip/info/entry',
		element: InfoEntry,
		type: 'lab_dip',
		hidden: true,
		page_name: 'lab_dip__info_entry',
		actions: ['create', 'read', 'update', 'delete'],
	},
	{
		id: 151,
		name: 'Info Update',
		path: '/lab-dip/info/update/:info_number/:info_uuid',
		element: InfoEntry,
		page_name: 'lab_dip__info_entry_update',
		hidden: true,
		actions: ['create', 'read', 'update', 'delete'],
		isDynamic: true,
	},
	{
		id: 1,
		name: 'Recipe',
		path: '/lab-dip/recipe',
		element: Recipe,
		type: 'lab_dip',
		page_name: 'lab_dip__recipe',
		actions: ['create', 'read', 'update', 'delete'],
	},
	{
		id: 15,
		name: 'Recipe Entry',
		path: '/lab-dip/recipe/entry',
		element: RecipeEntry,
		type: 'lab_dip',
		hidden: true,
		page_name: 'lab_dip__recipe_entry',
		actions: ['create', 'read', 'update', 'delete'],
	},
	{
		id: 151,
		name: 'Recipe Update',
		path: '/lab-dip/recipe/update/:recipe_id/:recipe_uuid',
		element: RecipeEntry,
		page_name: 'lab_dip__recipe_entry_update',
		hidden: true,
		actions: ['create', 'read', 'update', 'delete'],
		isDynamic: true,
	},
	{
		id: 142,
		name: 'Recipe Details',
		path: '/lab-dip/recipe/details/:recipe_uuid',
		element: RecipeDetails,
		type: 'lab_dip',
		hidden: true,
		page_name: 'lab_dip__recipe_details',
		actions: ['read', 'update'],
		isDynamic: true,
	},
];
