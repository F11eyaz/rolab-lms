package main

import (
	"fmt"

	"github.com/joho/godotenv"
	"github.com/rolab/lms/internal/config"
	"github.com/rolab/lms/internal/database"
	"github.com/rolab/lms/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../../.env")
	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)
	database.Migrate(db)

	// Admin user
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 12)
	admin := models.User{Email: "admin@rolab.kz", Password: string(hash), Role: "admin"}
	db.FirstOrCreate(&admin, models.User{Email: "admin@rolab.kz"})
	fmt.Println("Admin:", admin.Email, "/ password: admin123")

	// Company
	company := models.Company{
		Name:          "RoLab Education",
		Description:   "Современная онлайн-платформа для качественного образования. Мы объединяем лучших преподавателей и инновационные методы обучения.",
		Mission:       "Сделать качественное образование доступным для каждого студента Казахстана.",
		PhoneNumber:   "+7 (777) 123-45-67",
		Email:         "info@rolab.kz",
		Address:       "г. Алматы, ул. Абая, 150",
		FoundedYear:   2020,
		StudentsCount: 15000,
		CoursesCount:  50,
		TeachersCount: 30,
	}
	db.FirstOrCreate(&company, models.Company{})

	// Categories
	categories := []models.Category{
		{Name: "ЕНТ", Slug: "ent", OrderIndex: 1},
		{Name: "НИШ, БИЛ, Дарын", Slug: "nish", OrderIndex: 2},
		{Name: "Школьные предметы", Slug: "school", OrderIndex: 3},
		{Name: "Другие курсы", Slug: "other", OrderIndex: 4},
	}
	for _, cat := range categories {
		db.FirstOrCreate(&cat, models.Category{Slug: cat.Slug})
	}

	// Teachers
	teachers := []models.Teacher{
		{Name: "Айгерим Сейткали", Bio: "Преподаватель математики с 10-летним опытом. Подготовила более 500 учеников к ЕНТ.", Specialty: "Математика, ЕНТ", Experience: 10, OrderIndex: 1},
		{Name: "Нурлан Бекжанов", Bio: "Учитель физики и информатики. Победитель республиканских олимпиад.", Specialty: "Физика, Информатика", Experience: 8, OrderIndex: 2},
		{Name: "Жанар Курсабаева", Bio: "Специалист по истории Казахстана. Автор методических пособий для подготовки к ЕНТ.", Specialty: "История Казахстана", Experience: 12, OrderIndex: 3},
		{Name: "Мирас Нысанбек", Bio: "Эксперт по комплексной подготовке к ЕНТ. Разработал уникальную методику обучения.", Specialty: "Комплексная подготовка", Experience: 7, OrderIndex: 4},
	}
	for i := range teachers {
		db.FirstOrCreate(&teachers[i], models.Teacher{Name: teachers[i].Name})
	}

	// Get categories
	var catENT, catSchool models.Category
	db.First(&catENT, models.Category{Slug: "ent"})
	db.First(&catSchool, models.Category{Slug: "school"})

	// Combo Course
	combo := models.Course{
		Title:         "ЕНТ КОМБО основные предметы",
		Description:   "<p>Самое важное при подготовке к ЕНТ — это время. 3 основных предмета собраны в одном месте, чтобы обеспечить ученику возможность эффективно использовать своё время и получать систематические знания.</p><p>Желаем вам качественного и доступного образования и удачи в поступлении на грант!</p>",
		Price:         7450,
		Language:      "ru",
		CategoryID:    catENT.ID,
		IsCombo:       true,
		Duration:      "1 мес",
		AverageRating: 5,
		ReviewsCount:  8,
	}
	db.FirstOrCreate(&combo, models.Course{Title: "ЕНТ КОМБО основные предметы"})
	db.Model(&combo).Association("Teachers").Replace([]models.Teacher{teachers[3]})

	// Programs inside combo
	prog1 := models.Program{
		Title:       "История Казахстана ЕНТ",
		Description: "Полный курс по истории Казахстана для подготовки к ЕНТ. 100 уроков с тестами.",
		Price:       4950,
		CourseID:    combo.ID,
		OrderIndex:  1,
	}
	db.FirstOrCreate(&prog1, models.Program{Title: "История Казахстана ЕНТ", CourseID: combo.ID})
	db.Model(&prog1).Association("Teachers").Replace([]models.Teacher{teachers[2]})

	prog2 := models.Program{
		Title:       "Грамотность чтения ЕНТ",
		Description: "Курс по грамотности чтения для ЕНТ.",
		Price:       4950,
		CourseID:    combo.ID,
		OrderIndex:  2,
	}
	db.FirstOrCreate(&prog2, models.Program{Title: "Грамотность чтения ЕНТ", CourseID: combo.ID})

	prog3 := models.Program{
		Title:       "Математическая грамотность ЕНТ",
		Description: "Курс по математической грамотности для ЕНТ.",
		Price:       4950,
		CourseID:    combo.ID,
		OrderIndex:  3,
	}
	db.FirstOrCreate(&prog3, models.Program{Title: "Математическая грамотность ЕНТ", CourseID: combo.ID})

	// Update combo lessons count
	db.Model(&combo).Update("lessons_count", 213)

	// Lessons for program 1
	lessons := []models.Lesson{
		{
			Title:      "Казахстан в эпоху камня — Палеолит",
			Content:    "<h2>Палеолит (древний каменный век)</h2><p>Палеолит — древнейший период каменного века, охватывающий время от появления человека до около 12 000 лет назад.</p><h3>Основные характеристики</h3><ul><li>Люди занимались охотой и собирательством</li><li>Использовали грубо обработанные каменные орудия</li><li>Жили небольшими группами</li><li>Вели кочевой образ жизни</li></ul><h3>Стоянки на территории Казахстана</h3><p>На территории современного Казахстана обнаружены следующие палеолитические стоянки:</p><ol><li><strong>Арыстанды</strong> — одна из древнейших стоянок в Южном Казахстане</li><li><strong>Казангап</strong> — стоянка в Западном Казахстане</li><li><strong>Шоктас</strong> — памятник среднего палеолита</li></ol>",
			ProgramID:  prog1.ID,
			OrderIndex: 1,
		},
		{
			Title:      "Мезолит, неолит, энеолит",
			Content:    "<h2>Мезолит (средний каменный век)</h2><p>Мезолит — переходный период между палеолитом и неолитом (12 000–7 000 лет назад).</p><p>В этот период произошло потепление климата, что привело к значительным изменениям в жизни людей.</p><h3>Неолит</h3><p>Неолит (новый каменный век) — период 7 000–4 000 лет до н.э. Характеризуется переходом к производящему хозяйству: <strong>земледелию и скотоводству</strong>.</p>",
			ProgramID:  prog1.ID,
			OrderIndex: 2,
		},
		{
			Title:      "Эпоха бронзы",
			Content:    "<h2>Бронзовый век в Казахстане (2000–800 лет до н.э.)</h2><p>Бронзовый век — важнейший период в истории Казахстана, когда сформировалась <strong>андроновская культура</strong>.</p><h3>Андроновская культура</h3><p>Андроновская культура охватывала огромные территории Евразийских степей. Её носители:</p><ul><li>Занимались пастбищным скотоводством</li><li>Умели плавить бронзу</li><li>Строили укреплённые поселения</li><li>Практиковали захоронения в курганах</li></ul>",
			ProgramID:  prog1.ID,
			OrderIndex: 3,
		},
	}
	for i := range lessons {
		db.FirstOrCreate(&lessons[i], models.Lesson{Title: lessons[i].Title, ProgramID: lessons[i].ProgramID})
	}
	db.Model(&prog1).Update("lessons_count", 100)

	// Regular course
	course2 := models.Course{
		Title:         "Математика для ЕНТ — продвинутый уровень",
		Description:   "<p>Углублённый курс математики для подготовки к ЕНТ. Включает все темы школьной программы плюс олимпиадные задачи.</p>",
		Price:         5500,
		Language:      "ru",
		CategoryID:    catENT.ID,
		IsCombo:       false,
		Duration:      "2 мес",
		AverageRating: 4.8,
		ReviewsCount:  12,
		LessonsCount:  60,
	}
	db.FirstOrCreate(&course2, models.Course{Title: "Математика для ЕНТ — продвинутый уровень"})
	db.Model(&course2).Association("Teachers").Replace([]models.Teacher{teachers[0]})

	mathProg := models.Program{
		Title:       "Алгебра и начала анализа",
		Description: "Полный курс алгебры для ЕНТ",
		Price:       5500,
		CourseID:    course2.ID,
		OrderIndex:  1,
	}
	db.FirstOrCreate(&mathProg, models.Program{Title: "Алгебра и начала анализа", CourseID: course2.ID})

	mathLesson := models.Lesson{
		Title:      "Степени и корни",
		Content:    "<h2>Степени и корни</h2><p>В этом уроке мы рассмотрим основные свойства степеней и корней, которые часто встречаются в заданиях ЕНТ.</p><h3>Свойства степеней</h3><ul><li>a^m · a^n = a^(m+n)</li><li>a^m / a^n = a^(m-n)</li><li>(a^m)^n = a^(mn)</li><li>(ab)^n = a^n · b^n</li></ul><h3>Квадратные корни</h3><p>√(a·b) = √a · √b при a≥0, b≥0</p>",
		ProgramID:  mathProg.ID,
		OrderIndex: 1,
	}
	db.FirstOrCreate(&mathLesson, models.Lesson{Title: "Степени и корни", ProgramID: mathProg.ID})
	db.Model(&mathProg).Update("lessons_count", 60)

	// Reviews (по программам)
	reviews := []models.Review{
		{ProgramID: prog1.ID, AuthorName: "Айдана К.", Rating: 5, Comment: "Отличный курс по истории! Очень помог при подготовке к ЕНТ.", IsApproved: true},
		{ProgramID: prog1.ID, AuthorName: "Бекзат М.", Rating: 5, Comment: "Преподаватель объясняет очень доходчиво. Рекомендую всем!", IsApproved: true},
		{ProgramID: prog2.ID, AuthorName: "Диана С.", Rating: 4, Comment: "Хороший материал по грамотности чтения.", IsApproved: true},
		{ProgramID: mathProg.ID, AuthorName: "Ерлан Б.", Rating: 5, Comment: "Лучший курс по математике! Набрал 130 баллов на ЕНТ.", IsApproved: true},
	}
	for i := range reviews {
		db.FirstOrCreate(&reviews[i], models.Review{ProgramID: reviews[i].ProgramID, AuthorName: reviews[i].AuthorName})
	}

	fmt.Println("Seed completed successfully!")
}
