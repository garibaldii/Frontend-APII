import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertaComponent } from '../../components/ComponentesVisuais/alerta/alerta.component';


@Injectable({
  providedIn: 'root',
})
export class ProfessorService {



  constructor(private http: HttpClient, private router: Router, private modalService: NgbModal) { }

  baseUrl = 'https://backend-api-7cos.onrender.com'

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  //Banco de Dados, Interacao com o BackEnd 🎲

  //Create 🆕
  cadastrar(
    event: Event,
    nome: String,
    matriculaId: String,
    unidadeId: String,
    titulacao: String,
    referencia: String,
    lattes: String,
    coursesId: [String],
    statusAtividade: String,
    email: String,
    notes: String) {

    const novoProfessor = {
      nome,
      matriculaId,
      unidadeId,
      titulacao,
      referencia,
      lattes,
      coursesId,
      statusAtividade,
      email,
      notes
    }

    const headers = this.getAuthHeaders();
    event.preventDefault();
    this.http
      .post<any>(this.baseUrl + '/professors/', novoProfessor, { headers })
      .subscribe({
        next: (response) => {
          console.log('Resposta da atualização:', response)
          const modalRef = this.modalService.open(AlertaComponent, { centered: true });
          modalRef.componentInstance.acao = 'Cadastro 📝';
          modalRef.componentInstance.mensagem = 'Professor cadastrado com sucesso. 🚀';
          modalRef.componentInstance.mostrarBotoes = false;
          this.router.navigate(["/home"])
        },
        error: (error) => {
          console.log('Resposta da atualização:', error);

          const modalRef = this.modalService.open(AlertaComponent, { centered: true });
          modalRef.componentInstance.acao = 'Cadastro 📝';
          modalRef.componentInstance.mensagem = 'Erro ao cadastrar professor. ❌';
          modalRef.componentInstance.mostrarBotoes = false;
        },
      });


  }

  //Read 📖
  listar(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/professors/`, { headers });
  }

  //Update 🔁
  atualizar(id: string, professorAtualizado: any) {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.baseUrl}/professors/${id}`, professorAtualizado, { headers }).subscribe({
      next: (response) => {
        console.log('Resposta da atualização:', response);

        const modalRef = this.modalService.open(AlertaComponent, { centered: true });
        modalRef.componentInstance.acao = 'Atualização 🔁';
        modalRef.componentInstance.mensagem = 'Professor atualizado com sucesso! ✅';
        modalRef.componentInstance.mostrarBotoes = false;
        this.router.navigate(["/tela-relatorio-professor"])
      },
      error: (error) => {
        console.error('Erro ao atualizar Professor:', error);
        const modalRef = this.modalService.open(AlertaComponent, { centered: true });
        modalRef.componentInstance.acao = 'Atualização 🔁';
        modalRef.componentInstance.mensagem = 'Erro ao atualizar o professor! ❌';
        modalRef.componentInstance.mostrarBotoes = false;
      }
    })
  }

  //Delete 🗑️
  deletar(matriculaId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.baseUrl}/professors/${matriculaId}`, { headers });
  }




  // ❗Métodos que usarão o crud porém trabalhando de forma específica. ❗


  //Retorna o professor de acordo com o nome.
  retornaProfessor(nome: String | null): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.baseUrl}/professors/${nome}`, { headers });

  }

  //Retorna o professor de acordo com o nome.
  carregaProfessorPeloNome(nome: string | null): Observable<any> {
    return this.retornaProfessor(nome).pipe(
      map(data => {
        if (Array.isArray(data) && data.length > 0) {
          const objetoProfessor = data.find(prof => prof.nome === nome);
          if (objetoProfessor) {
            return Object.assign({}, objetoProfessor);
          } else {
            throw new Error('Professor não encontrado com o nome fornecido.');
          }
        } else {
          throw new Error('Lista de professores vazia ou inválida.');
        }
      }),
      catchError(error => {
        throw new Error('Erro ao obter professor:' + error);
      })
    );
  }

  //Popula a lista de professores do componente com o que está cadastrado no banco de dados.
  listarProfessores(professores: any[]): void {

    this.listar().subscribe(
      (professoresCadastrados) => {
        professores.splice(0, professores.length, ...professoresCadastrados)
        //Splice está formatando a variável professores para poder receber os professores cadastrados vindo do banco de dados.

      },
      (error) => {
        alert(`Erro ao listar professores: ${JSON.stringify(error)}`);
      }
    );

  }


  //filtra professor com base nos dados selecionados na interface.
  filtrarProfessores(nome: string, cursos: string[], titulacoes: string[]): Observable<Object[]> {
    let params = new HttpParams();
    if (nome) {
      params = params.append('nome', nome);
    }
    if (cursos && cursos.length) {
      params = params.append('cursos', cursos.join(','));
    }
    if (titulacoes && titulacoes.length) {
      params = params.append('titulacoes', titulacoes.join(','));
    }

    alert(params)

    const headers = this.getAuthHeaders();

    return this.http.get<Object[]>(`${this.baseUrl}/professors/filter`, { params, headers });
  }
}
