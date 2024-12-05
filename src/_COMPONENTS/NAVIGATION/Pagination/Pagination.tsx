import React from 'react'
import './pagination.css'
/**
 * 
 * @param {Int} currentPage page actuelle de la pagination
 * @param {Function} setCurrentPage fonction pour mettre à jour la page actuelle sur le component parent
 * @param {Int} totalPage (optionnel) nombre total de pages pour la pagination
 *  
 * @returns 
 */

interface Props {
    currentPage: number,
    totalPage: number,
    setCurrentPage: (page: number, delay: boolean) => void
}

export default function Pagination({ currentPage, totalPage, setCurrentPage }: Props) {

    /* FUNCTIONS */
    const changePage = (direction: number, value: number = -1) => {
        if (value >= 1) {
            if (totalPage) {
                value <= totalPage ? setCurrentPage(value, true) : setCurrentPage(totalPage, true);
            } else {
                setCurrentPage(value, true);
            }
        } else if (direction === -1 && currentPage > 0) {
            setCurrentPage(currentPage + direction, false);
        } else if (direction === 1) {
            setCurrentPage(currentPage + direction, false);
        }
    };

    return (
        <div className='m-b-10 pagination'>
            <div className="pagination-actions">
                <button type='button' disabled={currentPage <= 1} onClick={() => changePage(-1)}>&#10094; </button>
                <input onInput={(e) => changePage(0, parseInt(e.currentTarget.value))} min="1" max="" type="number" value={(currentPage)} />
                <button type='button' disabled={currentPage >= totalPage} onClick={() => changePage(1)}> &#10095; </button>
            </div>
            {totalPage > 0 ? <div className='center' style={{ width: "150px" }} ><i>{`page ${currentPage} / ${totalPage}`}</i></div> : null}
        </div>
    )
}
