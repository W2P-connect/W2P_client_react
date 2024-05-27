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
export default function Pagination({ currentPage, totalPage, setCurrentPage }) {

    /* FUNCTIONS */
    const changePage = (direction, value = false) => {
        if (value && value >= 1) {
            if (totalPage) {
                value <= totalPage ? setCurrentPage(parseInt(value)) : setCurrentPage(totalPage);
            } else {
                setCurrentPage(parseInt(value));
            }
        } else if (direction === -1 && currentPage > 0) {
            setCurrentPage(parseInt(currentPage + direction));
        } else if (direction === 1) {
            setCurrentPage(parseInt(currentPage + direction));
        }
    };

    return (
        <div className='pagination m-b-10'>
            <div className="pagination-actions">
                <button type='button' disabled={currentPage <= 1} onClick={() => changePage(-1)}>&#10094; </button>
                <input onInput={(e) => changePage(0, e.target.value)} min="1" max="" type="number" value={(currentPage)} />
                <button type='button' disabled={currentPage >= totalPage} onClick={() => changePage(1)}> &#10095; </button>
            </div>
            {totalPage ? <div className='center' style={{ width: "150px" }} ><i>{`page ${currentPage} / ${totalPage}`}</i></div> : null}
        </div>
    )
}
