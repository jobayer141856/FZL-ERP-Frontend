import cn from "@lib/cn";

const controlStyles = {
	base: "input input-primary w-full rounded-md px-2 text-sm transition-all duration-200 ease-in-out",
	focus: "outline outline-offset-2 outline-8",
	nonFocus: "border-primary",
	disabled:
		"bg-gray-50 border border-error text-primary/40 cursor-not-allowed",
};
const placeholderStyles = "text-white text-[0.1rem]";

// Single Value
const selectInputStyles = "grow";
const singleValueStyles = "grow";

// Multi Value
const multiValueLabelStyles = "rounded-md mr-1";
const multiValueStyles = "m-0.5 border px-2 py-1 rounded-md border-primary";
const multiValueRemoveStyles =
	"w-5 h-5 text-error bg-error/10 text-sm rounded-md hover:bg-error/40 hover:text-error hover:cursor-pointer hover:shadow-2xl hover:active:bg-error/60 hover:active:text-error hover:active:shadow-none";

// Indicators
const indicatorsContainerStyles = "text-primary";
const clearIndicatorStyles =
	"text-error bg-error/10 text-sm rounded-md hover:bg-error/40";
const indicatorSeparatorStyles = "";
// const indicatorSeparatorStyles = "bg-primary";

// drop down menu
const dropdownIndicatorStyles = "";
const menuStyles =
	"bg-white border-2 border-primary/80 rounded-md shadow-2xl shadow-inner text-sm";

// group heading
const groupHeadingStyles = "text-gray-500 text-sm bg-error";
const optionStyles = {
	base: "p-1 rounded-md border-b border-primary shadow-2xl text-sm hover:cursor-pointer hover:bg-secondary",
	focus: "bg-secondary text-primary active:bg-primary",
	selected:
		"after:content-['✔'] after:ml-2 after:text-success flex justify-between bg-primary text-primary-content active:bg-primary",
};
const noOptionsMessageStyles =
	"text-error-content p-2 bg-error/60 border border-dashed border-gray-200 rounded-md";

const classNames = {
	control: ({ isFocused, isDisabled }) =>
		cn(
			isFocused ? controlStyles.focus : controlStyles.nonFocus,
			isDisabled && controlStyles.disabled,
			controlStyles.base
		),
	placeholder: () => placeholderStyles,
	input: () => selectInputStyles,
	singleValue: () => singleValueStyles,
	multiValue: () => multiValueStyles,
	multiValueLabel: () => multiValueLabelStyles,
	multiValueRemove: () => multiValueRemoveStyles,
	indicatorsContainer: () => indicatorsContainerStyles,
	clearIndicator: () => clearIndicatorStyles,
	indicatorSeparator: () => indicatorSeparatorStyles,
	dropdownIndicator: () => dropdownIndicatorStyles,
	menu: () => menuStyles,
	groupHeading: () => groupHeadingStyles,
	option: ({ isFocused, isSelected }) =>
		cn(
			optionStyles.base,
			isFocused && optionStyles.focus,
			isSelected && optionStyles.selected
		),
	noOptionsMessage: () => noOptionsMessageStyles,
};

const styles = {
	input: (base) => ({
		...base,
		// "input:focus": {
		// 	border: "ring-2 ring-primary ring",
		// },
	}),
	multiValueLabel: (base) => ({
		...base,
		whiteSpace: "normal",
		overflow: "visible",
	}),
};

export { classNames, styles };
