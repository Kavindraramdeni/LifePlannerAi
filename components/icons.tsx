

import React from 'react';

// Define a reusable type for icon props to allow passing any SVG attributes, including `style`.
type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

// FIX: Renamed `path` to `pathData` to avoid conflict with standard SVG attribute types.
const Icon: React.FC<IconProps & { pathData: string | string[] }> = ({ pathData, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {Array.isArray(pathData) ? pathData.map((p, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" d={p} />) : <path strokeLinecap="round" strokeLinejoin="round" d={pathData} />}
    </svg>
);

export const CheckSquareIcon: React.FC<{ isChecked: boolean; className?: string }> = ({ isChecked, className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isChecked ? (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 12C20.25 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 3.75 16.5563 3.75 12C3.75 7.44365 7.44365 3.75 12 3.75C16.5563 3.75 20.25 7.44365 20.25 12Z" />
            </>
        ) : (
            <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="2" strokeWidth="1.5" />
        )}
    </svg>
);

// Update icon components to accept all standard SVG props.
export const PlayIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />;
export const SkipBackIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M21 16.5c0 .828-2.239 1.5-5 1.5s-5-.672-5-1.5c0-.829 2.239-1.5 5-1.5s5 .671 5 1.5zM16 16.5V7.5m0 9c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM9 18L3 12l6-6v12z" />;
export const SkipForwardIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3 16.5c0 .828 2.239 1.5 5 1.5s5-.672 5-1.5c0-.829-2.239-1.5-5-1.5S3 15.671 3 16.5zM8 16.5V7.5m0 9c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zM15 18l6-6-6-6v12z" />;
export const MoreHorizontalIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />;
export const MoreVerticalIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />;
export const SparklesIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.694-2.694L11.25 18l1.938-.648a3.375 3.375 0 002.694-2.694L16.25 13l.648 1.938a3.375 3.375 0 002.694 2.694L21.5 18l-1.938.648a3.375 3.375 0 00-2.694 2.694z" />;
export const ArrowLeftIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />;
export const PlusIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 4.5v15m7.5-7.5h-15" />;
export const TargetIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 21a9 9 0 100-18 9 9 0 000 18zm0-4a5 5 0 100-10 5 5 0 000 10zm0-2a3 3 0 100-6 3 3 0 000 6zm0-2a1 1 0 100-2 1 1 0 000 2z" />;
export const ImageIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm12-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />;
export const LineChartIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3 3v18h18" />;
export const MapPinIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />;
export const SunIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />;
export const MoonIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />;
export const TravelIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12.75 3.75a.75.75 0 00-1.5 0V4.5h-2.25V3.75a.75.75 0 00-1.5 0v.75H6a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 006 19.5h12a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5h-1.5v-.75a.75.75 0 00-1.5 0v.75h-2.25V3.75z" />;
export const WorkoutIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 6.252a6.25 6.25 0 110 12.504 6.25 6.25 0 010-12.504zM12 3.75v2.5m0 12.5v-2.5m6.25-6.25h-2.5m-7.5 0h2.5" />;
export const FlameIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M15.364 5.364A9 9 0 103.636 17.07a9 9 0 0011.728-11.707zM12 18.75c-1.336 0-2.5-1.164-2.5-2.5 0-1.336 2.5-4.336 2.5-4.336s2.5 3 2.5 4.336c0 1.336-1.164 2.5-2.5 2.5z" />;
export const HeartIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />;
export const BookshelfIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3 20.25h18" />;
export const TrendingUpIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M2.25 18L9 11.25l4.5 4.5L21.75 6" />;
export const TrendingDownIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M2.25 6L9 12.75l4.5-4.5L21.75 18" />;
export const DollarSignIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 6v12m-3-6h6" />;
export const PlusCircleIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />;
export const ShoppingCartIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.822l.383-1.822M7.5 14.25L5.106 5.106A2.25 2.25 0 002.869 3H2.25m0 0a2.25 2.25 0 000 4.5h.75" />;
export const HomeIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />;
export const UtensilsIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 21v-8.25M15.75 12.75c0 .828-1.679 1.5-3.75 1.5s-3.75-.672-3.75-1.5c0-.829 1.679-1.5 3.75-1.5s3.75.671 3.75 1.5zM21 12.75c0 .828-1.679 1.5-3.75 1.5s-3.75-.672-3.75-1.5c0-.829 1.679-1.5 3.75-1.5s3.75.671 3.75 1.5zM3 12.75c0 .828 1.679 1.5 3.75 1.5S10.5 13.578 10.5 12.75c0-.829-1.679-1.5-3.75-1.5S3 11.921 3 12.75z" />;
export const GiftIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12.75 3.75v4.5m0 0h-1.5m1.5 0h1.5m-1.5 0V3.75m0 4.5h-1.5m1.5 0h1.5M12 21v-4.5m0 0h-1.5m1.5 0h1.5m-1.5 0v4.5" />;
export const BriefcaseIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M10.5 6h3m-3 3h3m-3 3h3m2.25 3h-7.5a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 017.5 4.5h9A2.25 2.25 0 0118.75 6.75v9.75A2.25 2.25 0 0116.5 18.75h-2.25a2.25 2.25 0 00-2.25 2.25v.75" />;
export const SearchIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />;
export const FilterIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 3c2.755 0 5.455.232 8.083.678a1.5 1.5 0 011.08 1.428v7.508a1.5 1.5 0 01-.62 1.168l-4.5 3.75a1.5 1.5 0 01-2.122 0l-4.5-3.75a1.5 1.5 0 01-.62-1.168V5.106a1.5 1.5 0 011.08-1.428C6.545 3.232 9.245 3 12 3z" />;
export const BoldIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M8.25 5h4.5a3.75 3.75 0 010 7.5h-4.5V5zm0 7.5h5.25a3.75 3.75 0 010 7.5H8.25v-7.5z" />;
export const ItalicIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M10.5 5.25h3m-3 13.5h3M12 5.25L9.75 18.75" />;
export const ListUlIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />;
export const ListOlIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />;
export const DocumentTextIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />;
export const SettingsIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M9.594 3.94c.09-.542.56-1.008 1.11-1.226a1.125 1.125 0 011.27 0c.548.218 1.02.684 1.11 1.226M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM12 21a9 9 0 100-18 9 9 0 000 18z" />;
export const UserIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />;
export const LogOutIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3 0l3-3m0 0l-3-3m3 3H9" />;
export const DocumentIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-1.5 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />;
export const BookOpenIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />;
export const TrashIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />;
export const TagIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12.586 2.586a2 2 0 00-2.828 0L2.586 9.758a2 2 0 000 2.828l9.758 9.758a2 2 0 002.828 0l7.172-7.172a2 2 0 000-2.828L12.586 2.586zM9 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />;
export const ClipboardListIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData={["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", "M9 12h6m-6 4h6"]} />;
export const PencilIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />;
export const EyeIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />;
export const CheckIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M4.5 12.75l6 6 9-13.5" />;
export const ArrowUpIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M4.5 15.75l7.5-7.5 7.5 7.5" />;
export const ArrowDownIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M19.5 8.25l-7.5 7.5-7.5-7.5" />;
export const NoSymbolIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />;
export const UploadIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />;
export const DownloadIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m0 0l-4.5-4.5m4.5 4.5l4.5-4.5" />;
export const CalendarDaysIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M6.75 3.75h10.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25-2.25H6.75a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25zM16.5 2.25v1.5m-9-1.5v1.5m-2.25 4.5h13.5" />;
export const MenuIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />;
export const XMarkIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M6 18L18 6M6 6l12 12" />;
export const ArrowRightIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />;
export const CheckCircleIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
export const SortAscendingIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />;
export const ExchangeIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />;
export const ClockIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />;
export const PrinterIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M6.75 6.75C6.75 5.64543 7.64543 4.75 8.75 4.75H15.25C16.3546 4.75 17.25 5.64543 17.25 6.75V19.25L12 14.75L6.75 19.25V6.75Z M2.25 12C2.25 10.8954 3.14543 10 4.25 10H19.75C20.8546 10 21.75 10.8954 21.75 12V17.25C21.75 18.3546 20.8546 19.25 19.75 19.25H4.25C3.14543 19.25 2.25 18.3546 2.25 17.25V12Z" />;
export const SnowflakeIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />;
export const LeafIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />;
export const BellIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />;
export const PieChartIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />;
export const ListIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />;

// New Icons for Workout Features
export const TimerIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />; // Reusing Clock but can be specific
export const TrophyIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.25a2.25 2.25 0 00-2.25-2.25H11.25a2.25 2.25 0 00-2.25 2.25v10.125" />;
export const PlayCircleIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />;
export const StopCircleIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75c0-.414.336-.75.75-.75h4.5c.414 0 .75.336.75.75v4.5c0 .414-.336.75-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5z" />;
export const CalculatorIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M15.75 15.75v-1.5m-1.5 1.5h1.5m0 0h1.5m-1.5 0V18m-6-1.5h.008v.008H9.75v-.008zm0-2.25h.008v.008H9.75V14.25zm0-2.25h.008v.008H9.75V12zm0-2.25h.008v.008H9.75V9.75zm-1.5 2.25h.008v.008H8.25V12zm0-2.25h.008v.008H8.25V9.75zM6.75 18h7.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v7.5A2.25 2.25 0 006.75 18z" />;
export const YogaIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M12 3c-1.5 0-2.75 1-3 2.5A3 3 0 016 8c-1.5 0-2.5 1.25-2.5 2.75a2.5 2.5 0 002.5 2.5h12a2.5 2.5 0 002.5-2.5C20.5 9.25 19.5 8 18 8a3 3 0 01-3-2.5c-.25-1.5-1.5-2.5-3-2.5z M12 13.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />;
export const InfoIcon: React.FC<IconProps> = (props) => <Icon {...props} pathData="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 8.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />;