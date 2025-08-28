import { appDataStore } from '_STORES/AppData'
import { externalLinks } from 'appConstante'
import React from 'react'

export default function NeedHelpSection() {
    return (
        <div
            style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url('${appDataStore.appData.build_url}/images/bg-purple.jpg')`
            }}
            className='bg-cover bg-center shadow-md mb-12 p-4 rounded-xl'
        >
            <div className='flex justify-between items-center gap-4'>
                <span className='text-base'>👋 Need help? Follow our guide <a target='_blank' rel="noreferrer" className='underline' href={externalLinks.setupGuide}>here</a></span>
                <span className='flex items-center gap-4'>
                    or <button><a target='_blank' rel="noreferrer" href={externalLinks.contact}>contact us</a></button>

                </span>
            </div>
        </div >)
}
