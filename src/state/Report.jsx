import createGlobalState from '.';
import { reportQK } from './QueryKeys';

//* Stock
export const useReportStock = (from, to, { enabled = false }) =>
	createGlobalState({
		queryKey: reportQK.stock(from, to),
		url: `/report/material-stock-report?from_date=${from}&to_date=${to}`,
		enabled,
	});

export const useZipperProduction = () =>
	createGlobalState({
		queryKey: reportQK.zipperProduction(),
		url: '/report/zipper-production-status-report',
	});

export const useThreadProduction = () =>
	createGlobalState({
		queryKey: reportQK.threadProduction(),
		url: '/report/thread-production-batch-wise-report',
	});

export const useDailyChallan = () =>
	createGlobalState({
		queryKey: reportQK.dailyChallan(),
		url: '/report/daily-challan-report',
	});

export const usePIRegister = () =>
	createGlobalState({
		queryKey: reportQK.piRegister(),
		url: '/report/pi-register-report',
	});

export const usePIToBeSubmitted = () =>
	createGlobalState({
		queryKey: reportQK.piToBeSubmitted(),
		url: '/report/pi-to-be-register-report',
	});

export const useLC = (url) => {
	return createGlobalState({
		queryKey: reportQK.lc(url),
		url,
	});
};

export const useProductionReport = (url) =>
	createGlobalState({
		queryKey: reportQK.productionReport(url),
		url: `/report/production-report-${url}`,
	});
export const useDeliveryStatement = (url) =>
	createGlobalState({
		queryKey: reportQK.deliveryStatement(url),
		url: `/report/delivery-statement-report`,
	});

export const useProductionReportThreadPartyWise = () =>
	createGlobalState({
		queryKey: reportQK.productionReportThreadPartyWise(),
		url: `/report/production-report-thread-party-wise`,
	});
