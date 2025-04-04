<template>
    <div class="w-screen h-screen relative select-none max-h-screen overflow-y-auto overflow-x-hidden bg-gray-950 text-white">
        
        <!-- Header -->
        <header class="fixed top-0 left-0 right-0 bg-gray-950 w-[95%] px-6 py-5 flex justify-between items-center z-10">
            <h1 class="text-lg font-bold text-gray-50">DAX AI</h1>
            <nav class="flex gap-6 items-center">
                <a href="https://www.reddit.com/r/PowerBI/" target="_blank" rel="noopener noreferrer" class="text-gray-50 cursor-pointer sm:hover:text-gray-300 sm:transition">
                    Support
                </a>
                <a href="https://www.ko-fi.com/" target="_blank" rel="noopener noreferrer" 
                   class="flex items-center gap-2 bg-indigo-600 text-gray-50 px-3 py-1.5 rounded-lg font-medium text-sm border border-indigo-500 
                          sm:hover:bg-indigo-500 sm:transition-all sm:hover:scale-105 sm:hover:shadow-lg sm:hover:shadow-indigo-500/20"
                   title="Help keep DAX AI free">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>Help Support Free Access</span>
                </a>
            </nav>
        </header>

        <!--Content-->
        <div class="flex flex-col items-center mt-18" id="contentWrapper">
            <slot></slot>
        </div>
    </div>
</template>