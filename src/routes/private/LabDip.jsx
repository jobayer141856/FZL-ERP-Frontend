// Pages
import Log from '@/pages/LabDip/Log';
import RM from '@/pages/LabDip/RM';
import Info from '@pages/LabDip/Info';
import InfoDetails from '@pages/LabDip/Info/ByUUID';
import InfoEntry from '@pages/LabDip/Info/Entry';
import Recipe from '@pages/LabDip/Recipe';
import RecipeDetails from '@pages/LabDip/Recipe/ByRecipeId';
import RecipeEntry from '@pages/LabDip/Recipe/Entry';
import ShadeRecipe from '@pages/LabDip/ShadeRecipe';
import ShadeRecipeDetails from '@pages/LabDip/ShadeRecipe/Details/ByShadeRecipeId';
import ShadeRecipeEntry from '@pages/LabDip/ShadeRecipe/Entry';
import ThreadSwatch from '@pages/LabDip/ThreadSwatch';
import ZipperSwatch from '@pages/LabDip/ZipperSwatch';

export const LabDipRoutes = [
	{
		name: 'Lab Dip',
		children: [
			{
				name: 'RM',
				path: '/lab-dip/rm',
				element: <RM />,
				page_name: 'lab_dip__rm',
				actions: [
					'create',
					'read',
					'update',
					'delete',
					'click_name',
					'click_used',
				],
				isDynamic: true,
			},
			{
				name: 'Card',
				path: '/lab-dip/info',
				element: <Info />,
				page_name: 'lab_dip__info',
				actions: [
					'create',
					'read',
					'update',
					'delete',
					'click_status',
					'click_status_override',
				],
			},
			{
				name: 'Info Entry',
				path: '/lab-dip/info/entry',
				element: <InfoEntry />,
				hidden: true,
				page_name: 'lab_dip__info_entry',
				actions: ['create', 'read', 'update', 'delete'],
			},
			{
				name: 'Info Update',
				path: '/lab-dip/info/:info_number/:info_uuid/update',
				element: <InfoEntry />,
				page_name: 'lab_dip__info_entry_update',
				hidden: true,
				actions: ['create', 'read', 'update', 'delete'],
				isDynamic: true,
			},
			{
				name: 'Info Details',
				path: '/lab-dip/info/details/:info_uuid',
				element: <InfoDetails />,
				hidden: true,
				page_name: 'lab_dip__info_details',
				actions: ['read', 'update'],
				isDynamic: true,
			},
			{
				name: 'Recipe',
				path: '/lab-dip/recipe',
				element: <Recipe />,
				page_name: 'lab_dip__recipe',
				actions: [
					'create',
					'read',
					'update',
					'delete',
					'click_approve',
					'click_approve_override',
					'click_status',
					'click_status_override',
				],
			},
			{
				name: 'Recipe Entry',
				path: '/lab-dip/recipe/entry',
				element: <RecipeEntry />,
				hidden: true,
				page_name: 'lab_dip__recipe_entry',
				actions: ['create', 'read', 'update', 'delete'],
			},
			{
				name: 'Recipe Update',
				path: '/lab-dip/recipe/:recipe_id/:recipe_uuid/update',
				element: <RecipeEntry />,
				page_name: 'lab_dip__recipe_entry_update',
				hidden: true,
				actions: ['create', 'read', 'update', 'delete'],
				isDynamic: true,
			},
			{
				name: 'Recipe Details',
				path: '/lab-dip/recipe/details/:recipe_uuid',
				element: <RecipeDetails />,
				hidden: true,
				page_name: 'lab_dip__recipe_details',
				actions: ['create', 'read', 'update', 'delete'],
				isDynamic: true,
			},

			// {
			// 	name: 'Shade Recipe Entry',
			// 	path: '/lab-dip/shade_recipe/entry',
			// 	element: <ShadeRecipeEntry />,
			// 	hidden: true,
			// 	page_name: 'lab_dip__shade_recipe_entry',
			// 	actions: ['create', 'read', 'update', 'delete'],
			// },
			// {
			// 	name: 'Shade Recipe Details',
			// 	path: '/lab-dip/shade_recipe/:shade_recipe_uuid',
			// 	element: <ShadeRecipeDetails />,
			// 	hidden: true,
			// 	page_name: 'lab_dip__shade_recipe_details',
			// 	actions: ['create', 'read', 'update', 'delete'],
			// },
			// {
			// 	name: 'Shade Recipe',
			// 	path: '/lab-dip/shade_recipe',
			// 	element: <ShadeRecipe />,
			// 	page_name: 'lab_dip__shade_recipe',
			// 	actions: ['create', 'read', 'update', 'delete'],
			// },
			// {
			// 	name: 'Shade Recipe Update',
			// 	path: '/lab-dip/shade_recipe/:shade_recipe_uuid/update',
			// 	element: <ShadeRecipeEntry />,
			// 	page_name: 'lab_dip__shade_recipe_entry_update',
			// 	hidden: true,
			// 	actions: ['create', 'read', 'update', 'delete'],
			// 	isDynamic: true,
			// },
			{
				name: 'Zipper Swatch',
				path: '/lab-dip/zipper-swatch',
				element: <ZipperSwatch />,
				page_name: 'lab_dip__zipper_swatch',
				actions: [
					'read',
					'update',
					'click_swatch_status',
					'click_swatch_status_override',
				],
			},
			{
				name: 'Thread Swatch',
				path: '/lab-dip/thread-swatch',
				element: <ThreadSwatch />,
				page_name: 'lab_dip__thread_swatch',
				actions: [
					'read',
					'update',
					'click_swatch_status',
					'click_swatch_status_override',
				],
			},
			{
				name: 'Log',
				path: '/lab-dip/log',
				element: <Log />,
				page_name: 'lab_dip__log',
				actions: [
					'create',
					'read',
					'update',
					'delete',
					'click_name',
					'click_used',
					'click_update_rm_order',
					'click_delete_rm_order',
				],
				isDynamic: true,
			},
		],
	},
];
